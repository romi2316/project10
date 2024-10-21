/// <reference types="cypress" />

describe("Smoke Test", () => {
    // API request intercepts
    beforeEach(() => {
        cy.intercept({
            method: "GET",
            url: '/'
        }).as('getHomePage');

        cy.intercept({
            method: "GET",
            url: '/products'
        }).as('getProducts');

        cy.intercept({
            method: "GET",
            url: '/products/**'
        }).as('getProduct');

        cy.intercept({
            method: "GET",
            url: '/orders'
        }).as('getCart');
    });

    // Test 1: Check presence of login fields and buttons
    it('should check presence of login fields and buttons', () => {
        cy.visit('http://localhost:8080/'); // Visit home page
        cy.get('[data-cy="nav-link-login"]').click(); // Click on login button
        cy.url().should('eq', 'http://localhost:8080/#/login'); // Check URL of login page
        cy.get('[data-cy="login-input-username"]').should('exist'); // Check for email field
        cy.get('[data-cy="login-input-password"]').should('exist'); // Check for password field
        cy.get('[data-cy="login-submit"]').should('exist'); // Check for login button
        cy.get('[data-cy="nav-link-register"]').should('exist'); // Check for register button
    });

    // Test 2: Check presence of add to cart buttons when logged in
    it('should check presence of add to cart buttons when logged in', () => {
        cy.loginSuccess(); // Log in successfully
        cy.wait('@getHomePage'); // Wait for home page response
        cy.get('.text-header > button').click(); // Click on "Nos produits" button
        cy.wait('@getProducts'); // Wait for products response
        cy.get(':nth-child(1) > .add-to-cart > [data-cy="product-link"]').click(); // Click to view the first product
        cy.wait('@getProduct'); // Wait for product response
        cy.get('[data-cy="detail-product-add"]').should('exist'); // Check that 'Ajouter au panier' button exists
    });

    // Test 3: Check presence of product availability field
    it('should check presence of product availability field', () => {
        cy.loginSuccess(); // Log in successfully
        cy.wait('@getHomePage'); // Wait for home page
        cy.get('.text-header > button').click(); // Click on "Nos produits" button
        cy.wait('@getProducts'); // Wait for products
        cy.get(':nth-child(1) > .add-to-cart > [data-cy="product-link"]').click(); // Click to view the first product
        cy.wait('@getProduct'); // Wait for product details
        cy.get('[data-cy="detail-product-stock"]').should('exist'); // Check that availability field exists
    });
});
