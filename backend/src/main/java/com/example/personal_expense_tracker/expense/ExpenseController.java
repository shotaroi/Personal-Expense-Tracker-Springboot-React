package com.example.personal_expense_tracker.expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseRepository repository;

    public ExpenseController(ExpenseRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Expense> findAll(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {

        if (category != null && !category.isBlank() && startDate != null && endDate != null) {
            return repository.findByCategoryIgnoreCaseAndDateBetween(category, startDate, endDate);
        }

        if (category != null && !category.isBlank()) {
            return repository.findByCategoryIgnoreCase(category);
        }

        if (startDate != null && endDate != null) {
            return repository.findByDateBetween(startDate, endDate);
        }

        return repository.findAll();
    }

    @PostMapping
    public Expense create(@Valid @RequestBody Expense expense) {
        return repository.save(expense);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> findById(@PathVariable Long id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public Map<String, BigDecimal> getSummary(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {
        List<Expense> expenses = findAll(category, startDate, endDate);

        BigDecimal total = expenses.stream()
        .map(Expense::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of("total", total);
    }

    @GetMapping("/summary/by-category")
    public Map<String, BigDecimal> getSummaryByCategory(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {
        List<Expense> expenses = startDate != null && endDate != null 
        ? repository.findByDateBetween(startDate, endDate)
        : repository.findAll();

        return expenses.stream()
        .collect(Collectors.groupingBy(
            Expense::getCategory,
            Collectors.reducing(
                BigDecimal.ZERO,
                Expense::getAmount,
                BigDecimal::add
            )
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(
        @PathVariable Long id,
        @Valid @RequestBody Expense updatedExpense
    ) {
        return repository.findById(id)
            .map(expense -> {
                expense.setTitle(updatedExpense.getTitle());
                expense.setAmount(updatedExpense.getAmount());
                expense.setCategory(updatedExpense.getCategory());
                expense.setDate(updatedExpense.getDate());

                return ResponseEntity.ok(repository.save(expense));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
