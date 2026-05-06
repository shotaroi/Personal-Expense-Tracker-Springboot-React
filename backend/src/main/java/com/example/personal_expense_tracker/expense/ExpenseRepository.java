package com.example.personal_expense_tracker.expense;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByCategoryIgnoreCase(String category);

    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Expense> findByCategoryIgnoreCaseAndDateBetween(
        String category,
        LocalDate startDate,
        LocalDate endDate
    );
}
