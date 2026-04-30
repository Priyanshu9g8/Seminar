package com.gyansetu.repository;

import com.gyansetu.model.ClassLevel;
import com.gyansetu.model.User;
import com.gyansetu.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    List<User> findByRole(Role role);

    List<User> findByRoleAndClassLevel(Role role, ClassLevel classLevel);

    List<User> findByRoleAndCreatedById(Role role, Long createdById);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}





//import com.gyansetu.model.Role;
//import java.util.List;
//
//package com.gyansetu.repository;
//import com.gyansetu.model.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
//public interface UserRepository extends JpaRepository<User,Long> {
//    Optional<User> findByUsername(String username);
//    List<User> findByRole(Role role);
//
//    boolean existsByUsername(String username);
//    boolean existsByEmail(String email);
//
//}
