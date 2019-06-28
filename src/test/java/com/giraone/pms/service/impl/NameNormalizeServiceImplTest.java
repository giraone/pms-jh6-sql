package com.giraone.pms.service.impl;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;


class NameNormalizeServiceImplTest {

    @Autowired
    private NameNormalizeServiceImpl nameNormalizeService = new NameNormalizeServiceImpl();

    @Test
    void split() {

        assertEquals(Arrays.asList("schmidt", "wagner"), nameNormalizeService.split("Schmidt-Wagner"));
        assertEquals(Arrays.asList("heinz", "karl"), nameNormalizeService.split("Karl-Heinz"));
        assertEquals(Arrays.asList("heinz", "karl"), nameNormalizeService.split("Karl- Heinz"));
        assertEquals(Arrays.asList("heinz", "karl"), nameNormalizeService.split("Karl - Heinz"));
        assertEquals(Arrays.asList("wegner"), nameNormalizeService.split("Dr. Wegner"));
        assertEquals(Arrays.asList("vierer", "zwei"), nameNormalizeService.split("Ein Zwei Li Vierer"));
        assertEquals(Arrays.asList("zwei"), nameNormalizeService.split("X1 Zwei X3"));
    }

    @Test
    void normalize() {

        assertEquals("aether", nameNormalizeService.normalize("Äther"));
        assertEquals("tuer", nameNormalizeService.normalize(" Tür "));
    }

    @Test
    void reduceSimplePhonetic() {

        assertEquals("boem", nameNormalizeService.reduceSimplePhonetic("boehm"));
        assertEquals("boen", nameNormalizeService.reduceSimplePhonetic("boehn"));
        assertEquals("boek", nameNormalizeService.reduceSimplePhonetic("boeck"));
        assertEquals("koeler", nameNormalizeService.reduceSimplePhonetic("koehler"));
        assertEquals("bart", nameNormalizeService.reduceSimplePhonetic("barth"));
        assertEquals("smit", nameNormalizeService.reduceSimplePhonetic("schmidt"));
        assertEquals("smit", nameNormalizeService.reduceSimplePhonetic("schmied"));
        assertEquals("meir", nameNormalizeService.reduceSimplePhonetic("mayr"));
        assertEquals("meir", nameNormalizeService.reduceSimplePhonetic("maier"));
        assertEquals("smitz", nameNormalizeService.reduceSimplePhonetic("schmits"));
        assertEquals("krist", nameNormalizeService.reduceSimplePhonetic("christ"));
        assertEquals("richter", nameNormalizeService.reduceSimplePhonetic("richter"));
    }

    @Test
    void phonetic() {

        assertNull(nameNormalizeService.phonetic(""));
        assertEquals("A", nameNormalizeService.phonetic("A"));
        assertEquals("L", nameNormalizeService.phonetic("li"));

        assertEquals("HNS", nameNormalizeService.phonetic("heinz"));
        assertEquals("MR", nameNormalizeService.phonetic("maier"));
        assertEquals("XLS", nameNormalizeService.phonetic("schuelz"));
        assertEquals("XLSR", nameNormalizeService.phonetic("schuelzer"));
        assertEquals("XMT", nameNormalizeService.phonetic("schmidt"));
        assertEquals("XMT", nameNormalizeService.phonetic("schmit"));
        assertEquals("XMT", nameNormalizeService.phonetic("schmitt"));
    }

    @Test
    void replaceUmlauts() {

        assertEquals("ae", nameNormalizeService.replaceUmlauts("ä"));
        assertEquals("ae", nameNormalizeService.replaceUmlauts("Ä"));
        assertEquals("oe", nameNormalizeService.replaceUmlauts("ö"));
        assertEquals("oe", nameNormalizeService.replaceUmlauts("Ö"));
        assertEquals("ue", nameNormalizeService.replaceUmlauts("ü"));
        assertEquals("ue", nameNormalizeService.replaceUmlauts("Ü"));
        assertEquals("e", nameNormalizeService.replaceUmlauts("é"));
    }

    @Test
    void replaceSimplePhoneticVariants() {

        assertEquals("bart", nameNormalizeService.replaceSimplePhoneticVariants("barth"));
        assertEquals("smit", nameNormalizeService.replaceSimplePhoneticVariants("schmidt"));
        assertEquals("smit", nameNormalizeService.replaceSimplePhoneticVariants("schmied"));
        assertEquals("meir", nameNormalizeService.replaceSimplePhoneticVariants("mayr"));
        assertEquals("meir", nameNormalizeService.replaceSimplePhoneticVariants("maier"));
        assertEquals("smitz", nameNormalizeService.replaceSimplePhoneticVariants("schmits"));
        assertEquals("richter", nameNormalizeService.replaceSimplePhoneticVariants("richter"));
    }

    @Test
    void replaceDigits() {

        assertEquals("testl", nameNormalizeService.replaceDigits("test0"));
    }

    @Test
    void replaceCharacterRepetitions() {

        assertEquals("a", nameNormalizeService.replaceCharacterRepetitions("a"));
        assertEquals("a", nameNormalizeService.replaceCharacterRepetitions("aa"));
        assertEquals("a", nameNormalizeService.replaceCharacterRepetitions("aaa"));

        assertEquals("abc", nameNormalizeService.replaceCharacterRepetitions("abc"));
        assertEquals("abc", nameNormalizeService.replaceCharacterRepetitions("abbc"));
        assertEquals("abc", nameNormalizeService.replaceCharacterRepetitions("abcc"));
    }
}
