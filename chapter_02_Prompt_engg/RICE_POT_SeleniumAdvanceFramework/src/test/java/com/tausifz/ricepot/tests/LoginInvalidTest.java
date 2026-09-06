package com.tausifz.ricepot.tests;

import com.tausifz.ricepot.pages.LoginPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public final class LoginInvalidTest {
    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeTest(alwaysRun = true)
    public void setUpSuite() {
        try {
            driver = new ChromeDriver();
            driver.manage().window().maximize();
            loginPage = new LoginPage(driver);
        } catch (RuntimeException exception) {
            tearDownDriver();
            throw new IllegalStateException("Unable to initialize the invalid login test suite", exception);
        }
    }

    @BeforeMethod(alwaysRun = true)
    public void openLoginPage() {
        try {
            loginPage.open();
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to prepare the invalid Salesforce login test", exception);
        }
    }

    @DataProvider(name = "invalidCredentials")
    public Object[][] invalidCredentials() {
        return new Object[][] {
            { configuredValue("salesforce.invalid.username", "SALESFORCE_INVALID_USERNAME", "invalid.user@example.invalid"), configuredValue("salesforce.invalid.password", "SALESFORCE_INVALID_PASSWORD", "InvalidPassword!123") },
            { "", configuredValue("salesforce.invalid.password", "SALESFORCE_INVALID_PASSWORD", "InvalidPassword!123") }
        };
    }

    @Test(dataProvider = "invalidCredentials")
    public void invalidCredentialsShouldRemainOnLoginPage(String username, String password) {
        try {
            loginPage.setRememberMe(false);
            loginPage.login(username, password);
            Assert.assertTrue(loginPage.isLoginFormDisplayed(), "The login form should remain displayed after invalid credentials");
            Assert.assertTrue(loginPage.isLoginErrorDisplayed(), "A Salesforce login error should be displayed after invalid credentials");
        } catch (RuntimeException exception) {
            Assert.fail("The invalid Salesforce login flow failed", exception);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void resetBrowserState() {
        try {
            if (driver != null) {
                driver.manage().deleteAllCookies();
            }
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to reset browser state after invalid login test", exception);
        }
    }

    @AfterTest(alwaysRun = true)
    public void tearDown() {
        tearDownDriver();
    }

    private void tearDownDriver() {
        if (driver != null) {
            try {
                driver.quit();
            } catch (RuntimeException ignored) {
                driver = null;
            }
            driver = null;
        }
    }

    private String configuredValue(String propertyName, String environmentName, String defaultValue) {
        String propertyValue = System.getProperty(propertyName);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue;
        }
        String environmentValue = System.getenv(environmentName);
        return environmentValue == null || environmentValue.isBlank() ? defaultValue : environmentValue;
    }
}
