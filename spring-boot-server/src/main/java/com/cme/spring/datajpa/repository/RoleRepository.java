package com.cme.spring.datajpa.repository;

import java.util.Optional;

import com.cme.spring.datajpa.model.ERole;
import com.cme.spring.datajpa.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
  Optional<Role> findByName(ERole name);
}
