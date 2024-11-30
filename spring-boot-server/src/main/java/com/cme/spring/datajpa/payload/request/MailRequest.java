package com.cme.spring.datajpa.payload;

import lombok.Data;

@Data
public class MailRequest {
    private String to;
    private String subject;
    private String text;

}
