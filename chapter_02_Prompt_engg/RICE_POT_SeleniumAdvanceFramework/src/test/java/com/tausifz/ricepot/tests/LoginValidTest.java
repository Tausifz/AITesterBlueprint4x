package com.tausifz.ricepot.tests;

import java.time.Duration;
import com.tausifz.ricepot.pages.LoginPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

public final class LoginValidTest {
    private static final String DEFAULT_AUTHENTICATED_URL = "/lightning/";
    private static final String DEFAULT_AUTHENTICATED_XPATH = "//body[not(contains(@class,'login'))]";
    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeTest(alwaysRun = true)
    public void setUpSuite() {
        try {
            driver = new ChromeDriver();
            driver.manage().window().maximize();
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
            loginPage = new LoginPage(driver);
        } catch (RuntimeException exception) {
            tearDownDriver();
            throw new IllegalStateException("Unable to initialize the valid login test suite", exception);
        }
    }

    @BeforeMethod(alwaysRun = true)
    public void openLoginPage() {
        try {
            loginPage.open();
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to prepare the valid login test", exception);
        }
    }

    @Test
    public void validCredentialsShouldAuthenticateUser() {
        String username = requiredValue("salesforce.username", "SALESFORCE_USERNAME");
        String password = requiredValue("salesforce.password", "SALESFORCE_PASSWORD");
        String authenticatedUrl = configuredValue("salesforce.authenticated.url", "SALESFORCE_AUTHENTICATED_URL", DEFAULT_AUTHENTICATED_URL);
        String authenticatedXpath = configuredValue("salesforce.authenticated.xpath", "SALESFORCE_AUTHENTICATED_XPATH", DEFAULT_AUTHENTICATED_XPATH);

        try {
            loginPage.setRememberMe(false);
            loginPage.login(username, password);
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
            wait.until(ExpectedConditions.urlContains(authenticatedUrl));
            Assert.assertTrue(driver.getCurrentUrl().contains(authenticatedUrl), "The authenticated URL was not reached");
            Assert.assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(authenticatedXpath))).isDisplayed(), "The authenticated page element is not displayed");
        } catch (RuntimeException exception) {
            Assert.fail("The valid Salesforce login flow failed", exception);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void resetBrowserState() {
        try {
            if (driver != null) {
                driver.manage().deleteAllCookies();
            }
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to reset browser state after valid login test", exception);
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

    private String requiredValue(String propertyName, String environmentName) {
        String value = configuredValue(propertyName, environmentName, "");
        if (value.isBlank()) {
            throw new IllegalStateException("Missing required configuration: " + propertyName + " or " + environmentName);
        }
        return value;
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
