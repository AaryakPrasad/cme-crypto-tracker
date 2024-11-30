package com.cme.spring.datajpa.payload.request;

import lombok.Data;

@Data
public class MailRequest {
    private String to;
    private String subject;
    private String text;

}
