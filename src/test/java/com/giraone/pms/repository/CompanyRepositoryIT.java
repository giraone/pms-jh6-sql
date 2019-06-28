package com.giraone.pms.repository;

import com.giraone.pms.PmssqlApp;
import com.giraone.pms.domain.Company;
import com.giraone.pms.domain.User;
import jdk.nashorn.internal.ir.annotations.Ignore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = PmssqlApp.class)
@Transactional
class CompanyRepositoryIT {

    // TODO JUNIT4->5
    //@Rule
    //ExpectedException expectedException = ExpectedException.none();

    @Autowired
    private TestEntityManager testEntityManager;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void clearContent() {

        companyRepository.deleteAll();
        testEntityManager.flush();
    }

    @Test
    void saveNewCompany_succeeds() {

        // arrange
        Company company = new Company();
        company.setName("Test-Company");
        company.setExternalId("test1");

        // act
        companyRepository.save(company);

        // assert
        assertThat(companyRepository.count()).isEqualTo(1);
    }

    @Ignore // TODO
    @Test
    void save_existingCompany_throwsException() {

        // arrange
        Company company1 = this.saveCompany("test1");

        // TODO JUNIT4->5
        //expectedException.expect(DataIntegrityViolationException.class);
        //expectedException.expectMessage("could not execute statement; SQL [n/a]; constraint");

        // act
        Company company2 = this.saveCompany("test1"); // same external ID, where there is a unique constraint

        companyRepository.save(company2);

        // assert
    }

    @Test
    void savedCompany_isFoundByExternalId() {

        // arrange
        Company company = saveCompany("test1");

        // act
        Optional<Company> result = companyRepository.findOneByExternalId("test1");

        // assert
        assertThat(result.isPresent()).isTrue();
        assertThat(result.get().getId()).isEqualTo(company.getId());
        assertThat(result.get().getExternalId()).isEqualTo(company.getExternalId());
    }

    @Test
    void savedCompany_isFoundByExternalIdAndUsersLogin() {

        // arrange
        Company company = saveCompanyWithUser();

        // act
        Optional<Company> result = companyRepository.findOneByExternalIdAndUsersLogin("test1", "user");

        // assert
        assertThat(result.isPresent()).isTrue();
        assertThat(result.get().getId()).isEqualTo(company.getId());
        assertThat(result.get().getExternalId()).isEqualTo(company.getExternalId());
    }

    @Test
    void savedCompany_isFoundByIdAndUsersLogin() {

        // arrange
        Company company = saveCompanyWithUser();

        // act
        Optional<Company> result = companyRepository.findOneByIdAndUsersLogin(company.getId(), "user");

        // assert
        assertThat(result.isPresent()).isTrue();
        assertThat(result.get().getId()).isEqualTo(company.getId());
        assertThat(result.get().getExternalId()).isEqualTo(company.getExternalId());
    }

    @Test
    void savedCompany_findUsersByCompanyId() {

        // arrange
        Company company = saveCompanyWithUser();
        String userLogin = company.getUsers().iterator().next().getLogin();

        // act
        Page<User> result = companyRepository.findUsersOfCompanyByCompanyId(company.getId(), PageRequest.of(0, 10));

        // assert
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getLogin()).isEqualTo(userLogin);
    }

    @Test
    void savedCompany_findUsersByCompanyExternalId() {

        // arrange
        Company company = saveCompanyWithUser();
        String userLogin = company.getUsers().iterator().next().getLogin();

        // act
        Page<User> result = companyRepository.findUsersOfCompanyByCompanyExternalId(company.getExternalId(), PageRequest.of(0, 10));

        // assert
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getLogin()).isEqualTo(userLogin);
    }

    @Test
    void savedCompany_findCompaniesOfUserByUserId() {

        // arrange
        Company company = saveCompanyWithUser();
        long userId = company.getUsers().iterator().next().getId();

        // act
        Page<Company> result = companyRepository.findCompaniesOfUserByUserId(userId, PageRequest.of(0, 10));

        // assert
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getExternalId()).isEqualTo(company.getExternalId());
        assertThat(result.getContent().get(0).getUsers()).isNotNull();
        assertThat(result.getContent().get(0).getUsers()).isNotEmpty();
        assertThat(result.getContent().get(0).getUsers().iterator().next().getId()).isEqualTo(userId);
    }

    //------------------------------------------------------------------------------------------------------------------

    private Company saveCompany(String externalId) {
        Company company = new Company();
        company.setName("Test-Company " + externalId);
        company.setExternalId(externalId);
        company = companyRepository.save(company);
        return company;
    }

    private Company saveCompanyWithUser() {
        Company company = new Company();
        company.setName("Test-Company");
        company.setExternalId("test1");
        Set<User> users = new HashSet<>();
        Optional<User> user = userRepository.findOneByLogin("user");
        assertThat(user.isPresent()).isTrue();
        users.add(user.get());
        company.setUsers(users);
        company = companyRepository.save(company);
        return company;
    }
}
