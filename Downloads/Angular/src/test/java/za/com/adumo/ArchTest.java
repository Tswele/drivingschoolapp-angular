package za.com.adumo;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class ArchTest {

    @Test
    void servicesAndRepositoriesShouldNotDependOnWebLayer() {
        JavaClasses importedClasses = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("za.com.adumo");

        noClasses()
            .that()
            .resideInAnyPackage("za.com.adumo.service..")
            .or()
            .resideInAnyPackage("za.com.adumo.repository..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("..za.com.adumo.web..")
            .because("Services and repositories should not depend on web layer")
            .check(importedClasses);
    }
}
