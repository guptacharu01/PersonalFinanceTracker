package com.finance.tracker.repository;

import com.finance.tracker.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);
    // Ownership check in one query: a user can only delete their own transaction.
    Optional<Transaction> findByIdAndUserId(String id, String userId);
}
