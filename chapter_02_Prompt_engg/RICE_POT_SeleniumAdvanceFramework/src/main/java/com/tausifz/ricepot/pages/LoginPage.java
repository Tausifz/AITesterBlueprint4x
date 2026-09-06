package com.tausifz.ricepot.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public final class LoginPage {
    private static final String LOGIN_URL = "https://login.salesforce.com/?locale=in";
    private static final Duration WAIT_TIMEOUT = Duration.ofSeconds(20);
    private static final By LOGIN_FORM = By.xpath("//form[@id='login_form']");
    private static final By LOGIN_ERROR = By.xpath("//*[contains(@id,'error') or contains(@class,'error')][normalize-space()] | //div[@role='alert'][normalize-space()]");

    @FindBy(xpath = "//input[@id='username']")
    private WebElement usernameInput;

    @FindBy(xpath = "//input[@id='password']")
    private WebElement passwordInput;

    @FindBy(xpath = "//input[@id='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//input[@id='rememberUn']")
    private WebElement rememberMeCheckbox;

    private final WebDriver driver;
    private final WebDriverWait wait;

    public LoginPage(WebDriver driver) {
        if (driver == null) {
            throw new IllegalArgumentException("WebDriver must not be null");
        }
        this.driver = driver;
        this.wait = new WebDriverWait(driver, WAIT_TIMEOUT);
        PageFactory.initElements(driver, this);
    }

    public void open() {
        try {
            driver.get(LOGIN_URL);
            wait.until(ExpectedConditions.visibilityOfElementLocated(LOGIN_FORM));
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to open the Salesforce login page", exception);
        }
    }

    public void login(String username, String password) {
        try {
            enterUsername(username);
            enterPassword(password);
            submit();
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to submit Salesforce login credentials", exception);
        }
    }

    public void enterUsername(String username) {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameInput)).clear();
            usernameInput.sendKeys(username == null ? "" : username);
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to enter the Salesforce username", exception);
        }
    }

    public void enterPassword(String password) {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordInput)).clear();
            passwordInput.sendKeys(password == null ? "" : password);
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to enter the Salesforce password", exception);
        }
    }

    public void setRememberMe(boolean selected) {
        try {
            WebElement checkbox = wait.until(ExpectedConditions.elementToBeClickable(rememberMeCheckbox));
            if (checkbox.isSelected() != selected) {
                checkbox.click();
            }
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to set the Remember Me option", exception);
        }
    }

    public void submit() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to click the Salesforce login button", exception);
        }
    }

    public boolean isLoginFormDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(LOGIN_FORM)).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to determine whether the login form is displayed", exception);
        }
    }

    public boolean isLoginErrorDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(LOGIN_ERROR)).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to determine whether a login error is displayed", exception);
        }
    }
}
