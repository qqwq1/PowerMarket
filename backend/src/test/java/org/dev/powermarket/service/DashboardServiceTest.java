package org.dev.powermarket.service;

import org.dev.powermarket.domain.dto.DashboardDto;
import org.dev.powermarket.domain.enums.RentalRequestStatus;
import org.dev.powermarket.repository.RentalRepository;
import org.dev.powermarket.repository.RentalRequestRepository;
import org.dev.powermarket.repository.projection.IncomeChartProjection;
import org.dev.powermarket.repository.projection.RentalSummaryProjection;
import org.dev.powermarket.repository.projection.StatusCountProjection;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private RentalRepository rentalRepository;
    @Mock
    private RentalRequestRepository rentalRequestRepository;
    @Mock
    private AuthorizedUserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private final String email = "supplier@example.com";

    @Test
    void getDashboard_whenSupplierAndPeriodProvided_returnsAggregatedData() {
        LocalDate from = LocalDate.of(2024, 1, 1);
        LocalDate to = LocalDate.of(2024, 1, 31);
        User supplier = mock(User.class, Answers.RETURNS_DEEP_STUBS);

        when(supplier.getRole().name()).thenReturn("SUPPLIER");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(supplier));
        when(rentalRepository.countActiveRentalsBySupplierAndPeriod(supplier, from, to)).thenReturn(3L);
        when(rentalRepository.countCompletedRentalsAndTotalAmountBySupplierAndPeriod(supplier, from, to))
                .thenReturn(new TestRentalSummaryProjection(2L, BigDecimal.valueOf(500)));

        Instant fromInstant = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInstant = to.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        when(rentalRequestRepository.countPendingRequestsBySupplierAndPeriod(supplier, fromInstant, toInstant))
                .thenReturn(4L);
        when(rentalRequestRepository.getStatusCountsBySupplierAndPeriod(supplier, fromInstant, toInstant))
                .thenReturn(List.of(
                        new TestStatusCountProjection(RentalRequestStatus.PENDING, 2L),
                        new TestStatusCountProjection(RentalRequestStatus.IN_CONTRACT, 1L)
                ));
        when(rentalRepository.getIncomeChartDataBySupplierAndPeriod(supplier, from, to))
                .thenReturn(List.of(
                        new TestIncomeChartProjection(2024, 1, BigDecimal.valueOf(300), 1L),
                        new TestIncomeChartProjection(2024, 2, BigDecimal.valueOf(200), 1L)
                ));

        DashboardDto dto = dashboardService.getDashboard(email, from, to);

        assertThat(dto.role()).isEqualTo("SUPPLIER");
        assertThat(dto.period().from()).isEqualTo(from);
        assertThat(dto.period().to()).isEqualTo(to);

        DashboardDto.Summary summary = dto.summary();
        assertThat(summary.activeOrders()).isEqualTo(3L);
        assertThat(summary.completedOrders()).isEqualTo(2L);
        assertThat(summary.totalAmount()).isEqualByComparingTo("500");
        assertThat(summary.pendingRequests()).isEqualTo(4L);

        DashboardDto.StatusesChart statusesChart = dto.charts().statusesChart();
        assertThat(statusesChart.totalOrders()).isEqualTo(3L);
        assertThat(statusesChart.items()).anySatisfy(item ->
                assertThat(item.status()).isEqualTo("AWAITING_ACCEPTANCE")
        );
        assertThat(statusesChart.items()).anySatisfy(item ->
                assertThat(item.status()).isEqualTo("ACCEPTED")
        );

        DashboardDto.IncomeChart incomeChart = dto.charts().incomeChart();
        assertThat(incomeChart.currency()).isEqualTo("RUB");
        assertThat(incomeChart.points()).hasSize(2);
        assertThat(incomeChart.points().getFirst().periodStart()).isEqualTo(LocalDate.of(2024, 1, 1));
    }

    @Test
    void getDashboard_whenNonSupplierAndDatesMissing_returnsDefaultAggregations() {
        User user = mock(User.class, Answers.RETURNS_DEEP_STUBS);
        when(user.getRole().name()).thenReturn("CUSTOMER");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        LocalDate before = LocalDate.now();
        DashboardDto dto = dashboardService.getDashboard(email, null, null);
        LocalDate after = LocalDate.now();

        assertThat(dto.role()).isEqualTo("CUSTOMER");
        assertThat(dto.period().to()).isBetween(before, after);
        assertThat(dto.period().from()).isEqualTo(dto.period().to().minusDays(30));

        DashboardDto.Summary summary = dto.summary();
        assertThat(summary.activeOrders()).isZero();
        assertThat(summary.completedOrders()).isZero();
        assertThat(summary.totalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(summary.pendingRequests()).isZero();

        assertThat(dto.charts().statusesChart().totalOrders()).isZero();
        assertThat(dto.charts().statusesChart().items()).isEmpty();
        assertThat(dto.charts().incomeChart().points()).isEmpty();

        verifyNoInteractions(rentalRepository, rentalRequestRepository);
    }

    private record TestRentalSummaryProjection(Long count,
                                               BigDecimal totalAmount) implements RentalSummaryProjection {
        @Override public Long getCount() { return count; }
        @Override public BigDecimal getTotalAmount() { return totalAmount; }
    }

    private record TestStatusCountProjection(RentalRequestStatus status,
                                             Long count) implements StatusCountProjection {
        @Override public RentalRequestStatus getStatus() { return status; }
        @Override public Long getCount() { return count; }
    }

    private record TestIncomeChartProjection(int year,
                                             int month,
                                             BigDecimal totalAmount,
                                             Long completedOrders) implements IncomeChartProjection {
        @Override public Double getYear() { return (double) year; }
        @Override public Double getMonth() { return (double) month; }
        @Override public BigDecimal getTotalAmount() { return totalAmount; }
        @Override public Long getCompletedOrders() { return completedOrders; }
    }
}
