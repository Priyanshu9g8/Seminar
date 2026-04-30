package com.gyansetu.service;

import org.springframework.stereotype.Service;

@Service
public class TranslationService {

    public String translate(String text,String lang){

        if(lang.equals("hi"))
            return "हिंदी: " + text;

        if(lang.equals("pa"))
            return "ਪੰਜਾਬੀ: " + text;

        return text;

    }

}