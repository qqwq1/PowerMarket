package org.dev.powermarket.service;

import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.Review;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.repository.ReviewRepository;
import org.dev.powermarket.repository.ServiceRepository;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.dto.ReviewDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private AuthorizedUserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void getServiceReviews_WhenServiceExists_ReturnsDtos() {
        UUID serviceId = UUID.randomUUID();
        Service service = buildService();
        service.setId(serviceId);
        User reviewer = buildUser(UUID.randomUUID(), "Reviewer");
        User reviewed = buildUser(UUID.randomUUID(), "Reviewed");
        Review review = buildReview(service, reviewer, reviewed);

        Pageable pageable = PageRequest.of(0, 5);
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(reviewRepository.findByService(service, pageable))
                .thenReturn(new PageImpl<>(List.of(review)));

        var result = reviewService.getServiceReviews(serviceId, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().getFirst().getId()).isEqualTo(review.getId());
    }

    @Test
    void getUserReviews_WhenUserExists_ReturnsDtos() {
        UUID userId = UUID.randomUUID();
        Service service = buildService();
        User reviewer = buildUser(UUID.randomUUID(), "Reviewer");
        User reviewed = buildUser(userId, "Reviewed");
        Review review = buildReview(service, reviewer, reviewed);

        Pageable pageable = PageRequest.of(0, 3);
        when(userRepository.findById(userId)).thenReturn(Optional.of(reviewed));
        when(reviewRepository.findByReviewedUser(reviewed, pageable))
                .thenReturn(new PageImpl<>(List.of(review)));

        var page = reviewService.getUserReviews(userId, pageable);

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().getFirst().getReviewedUserId()).isEqualTo(userId);
    }

    @Test
    void getReview_WhenFound_ReturnsDto() {
        UUID reviewId = UUID.randomUUID();
        Service service = buildService();
        User reviewer = buildUser(UUID.randomUUID(), "Reviewer");
        User reviewed = buildUser(UUID.randomUUID(), "Reviewed");
        Review review = buildReview(service, reviewer, reviewed);
        review.setId(reviewId);

        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        ReviewDto dto = reviewService.getReview(reviewId);

        assertThat(dto.getId()).isEqualTo(reviewId);
        assertThat(dto.getReviewerId()).isEqualTo(reviewer.getId());
        verify(reviewRepository).findById(reviewId);
    }

    private Review buildReview(Service service, User reviewer, User reviewedUser) {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setService(service);
        review.setReviewer(reviewer);
        review.setReviewedUser(reviewedUser);
        review.setRental(buildRental(UUID.randomUUID()));
        review.setRating(5);
        review.setComment("Comment");
        review.setCreatedAt(Instant.now());
        return review;
    }

    private Rental buildRental(UUID id) {
        Rental rental = new Rental();
        rental.setId(id);
        return rental;
    }

    private Service buildService() {
        Service service = new Service();
        service.setId(UUID.randomUUID());
        service.setTitle("Service");
        service.setSupplier(buildUser(UUID.randomUUID(), "Supplier"));
        return service;
    }

    private User buildUser(UUID id, String name) {
        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(name.toLowerCase() + "@test.com");
        return user;
    }
}
