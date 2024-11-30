package com.cme.spring.datajpa.controller;

import com.cme.spring.datajpa.payload.request.MailRequest;
import com.cme.spring.datajpa.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public void sendEmail(@RequestBody MailRequest mailRequest){
        try {
            emailService.sendEmail(mailRequest.getTo(), mailRequest.getSubject(), mailRequest.getText());
            ResponseEntity.ok("Email sent successfully.");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
