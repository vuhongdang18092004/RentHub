package com.ioc.internship.repository.specification;

import com.ioc.internship.entity.RentalRequest;
import com.ioc.internship.entity.RequestStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class RentalRequestSpecification {

    public static Specification<RentalRequest> buildOwnerFilters(Long ownerId, String keyword, Long productId, RequestStatus status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Avoid N+1 Query on list fetching
            if (Long.class != query.getResultType()) {
                root.fetch("product", JoinType.LEFT);
                root.fetch("renter", JoinType.LEFT);
                root.fetch("owner", JoinType.LEFT);
            }

            predicates.add(criteriaBuilder.equal(root.get("owner").get("id"), ownerId));

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (productId != null) {
                predicates.add(criteriaBuilder.equal(root.get("product").get("id"), productId));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchKeyword = "%" + keyword.trim().toLowerCase() + "%";
                
                // product name
                Predicate productPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("product").get("name")), searchKeyword);
                
                // renter name (firstName + " " + lastName)
                Expression<String> renterFullName = root.get("renter").get("fullName"); // Đặt tên biến đồng nhất với field
                Predicate renterFullNamePredicate = criteriaBuilder.like(criteriaBuilder.lower(renterFullName), searchKeyword); // Truyền đúng biến renterFullName
                
                predicates.add(criteriaBuilder.or(productPredicate, renterFullNamePredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
