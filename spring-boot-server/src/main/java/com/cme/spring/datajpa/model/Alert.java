package com.cme.spring.datajpa.model;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
@Table(name = "alerts")
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crypto_id")
    private String cryptoId;

    @Column(name = "threshold")
    private double threshold;

    @Column(name = "condition")
    private String condition;

    @Column(name = "user_id")
    private Long userId;

    // Getters and Setters
}
