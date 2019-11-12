package com.giraone.pms.web.rest;

import com.giraone.pms.PmssqlApp;
import com.giraone.pms.security.AuthoritiesConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Collections;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test class for the PingApiResource REST controller.
 * SECURITY: Is done using .with(user(*)) in each MockMvc request.
 *
 * @see PingApiResource
 */
@SpringBootTest(classes = PmssqlApp.class)
public class PingApiResourceIT {

    private static final User DEFAULT_TRUSTED_SYSTEM_LOGIN = new User("trusted-system", "",
        Collections.singletonList(new SimpleGrantedAuthority(AuthoritiesConstants.TRUSTEDSYSTEM)));
    private static final User DEFAULT_USER_LOGIN = new User("user", "",
        Collections.singletonList(new SimpleGrantedAuthority(AuthoritiesConstants.USER)));

    @Autowired
    private WebApplicationContext wac;

    private MockMvc pingApiMockMvc;

    @BeforeEach
    public void setup() {
        this.pingApiMockMvc = MockMvcBuilders
            .webAppContextSetup(wac)
            .apply(springSecurity())
            .build();
    }

    @Test
    public void assertThat_ping_works_using_valid_user() throws Exception {

        // act/assert
        pingApiMockMvc.perform(get("/trusted-api/ping")
            .with(user(DEFAULT_TRUSTED_SYSTEM_LOGIN))
            .contentType(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("OK"));
    }

    @Test
    public void assertThat_ping_fails_using_invalid_grant() throws Exception {

        // act/assert
        pingApiMockMvc.perform(get("/trusted-api/ping")
            .with(user(DEFAULT_USER_LOGIN))
            .contentType(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isForbidden());
    }

    @Test
    public void assertThat_ping_fails_using_invalid_login() throws Exception {

        // act/assert
        pingApiMockMvc.perform(get("/trusted-api/ping")
            .contentType(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isUnauthorized());
    }
}

