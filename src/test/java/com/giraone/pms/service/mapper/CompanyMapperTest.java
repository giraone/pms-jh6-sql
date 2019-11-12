package com.giraone.pms.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;


public class CompanyMapperTest {

    private CompanyMapper companyMapper;

    @BeforeEach
    public void setUp() {
        companyMapper = new CompanyMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 2L;
        assertThat(companyMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(companyMapper.fromId(null)).isNull();
    }
}
