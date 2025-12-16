package org.dev.powermarket.domain.dto.response;

import org.dev.powermarket.domain.enums.ContractStatus;

public record ContractStatusDto(
        SupplierStatusDto supplier,
        TenantStatusDto tenant,
        ContractStatus contractStatus
) {
    public record SupplierStatusDto(
            boolean signed,
            Boolean signatureValid
    ) {}

    public record TenantStatusDto(
            boolean signed,
            Boolean signatureValid
    ) {}

}
