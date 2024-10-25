
describe("Connexion scénario", () => {
    it('should successfully login with correct credentials and display the cart button', () => {
        cy.visit('http://localhost:8080/'); // home page
        cy.get('[data-cy="nav-link-login"]').click() //connexion navbar btn
        cy.url('http://localhost:8080/#/login').should('exist')
        cy.get('[data-cy="login-input-username"]').type('test2@test.fr'); // email 
        cy.get('[data-cy="login-input-password"]').type('testtest'); // password 
        cy.get('[data-cy="login-submit"]').click() // se connecter btn
            .then(() => {
                cy.get('[data-cy="nav-link-cart"]').should('exist')
            })
    })
    it('should not login with incorrect credentials and display an error message', () => {
        cy.visit('http://localhost:8080/'); // home page
        cy.get('[data-cy="nav-link-login"]').click() //connexion navbar btn
        cy.url('http://localhost:8080/#/login').should('exist')
        cy.get('[data-cy="login-input-username"]').type('wrong@email.fr'); // email 
        cy.get('[data-cy="login-input-password"]').type('wrongpassword'); // password 
        cy.get('[data-cy="login-submit"]').click() // se connecter btn
            .then(() => {
                cy.get('[data-cy="login-errors"]').should('contain', 'Identifiants incorrects')
            })
    })

    it('should display an error message when trying to login with empty fields', () => {
        cy.visit('http://localhost:8080/'); // home page
        cy.get('[data-cy="nav-link-login"]').click() //connexion navbar btn
        cy.url('http://localhost:8080/#/login').should('exist')
        cy.get('[data-cy="login-submit"]').click() // se connecter btn
            .then(() => {
                cy.get('[data-cy="login-errors"]').should('contain', 'Merci de remplir correctement tous les champs')
            })
    })
})