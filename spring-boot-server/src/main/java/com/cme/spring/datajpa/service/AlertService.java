package com.cme.spring.datajpa.service;

import com.cme.spring.datajpa.model.Alert;
import com.cme.spring.datajpa.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlertService {
    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Optional<Alert> getAlertById(Long id) {
        return alertRepository.findById(id);
    }

    public Alert createAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public List<Alert> getAlertsByUserId(Long userId) {
        return alertRepository.findByUserId(userId);
    }

    public Alert updateAlert(Long id, Alert alertDetails) {
        Alert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setCryptoId(alertDetails.getCryptoId());
        alert.setThreshold(alertDetails.getThreshold());
        alert.setCondition(alertDetails.getCondition());
        alert.setUserId(alertDetails.getUserId());
        return alertRepository.save(alert);
    }

    public void deleteAlert(Long id) {
        alertRepository.deleteById(id);
    }
}