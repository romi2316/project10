describe("Cart Scenarios", () => {
  let initialStock;

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

    // Login before each test
    cy.loginSuccess();
    cy.wait(['@getHomePage']);
  });

  // Test case 1: Verify Product Addition to Cart with Stock Check
  it('should verify product addition to cart and stock update', () => {
    // Navigate to the product page
    cy.get('.text-header > button').click(); // Open "Our Products" section
    cy.wait(['@getProducts']);
    cy.get(':nth-child(3) > .add-to-cart > [data-cy="product-link"]').click(); // Click consulter
    cy.wait(['@getProduct']);

    // Step 2: Check initial stock
    cy.get('[data-cy="detail-product-stock"]').invoke('text').then((text) => {
      const match = text.match(/^(\d+)/); // Extract the number from stock text
      if (match) {
        initialStock = parseInt(match[0], 10); // Convert to integer
        cy.log('Initial stock: ' + initialStock);

        // Ensure the stock is greater than 0
        expect(initialStock).to.be.greaterThan(0);
      }
    });

    // Add product to cart
    cy.get('[data-cy="detail-product-add"]').click({ force: true }); // "Add to Cart"
    cy.wait(['@getCart']);

    // Verify product in cart
    cy.get('#cart-content').should('contain', 'Aurore boréale'); // Verify product name in cart

    // Step 5: Return to the product page and check stock update
    cy.get('[data-cy="nav-link-products"]').click(); // Go back to "Our Products"
    cy.wait(['@getProducts']);
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]').click(); // Revisit the same product
    cy.wait(['@getProduct']);
    cy.get('[data-cy="detail-product-stock"]').invoke('text').then((updatedText) => {
      const updatedMatch = updatedText.match(/^(\d+)/); // Extract the updated stock number
      if (updatedMatch) {
        const updatedStock = parseInt(updatedMatch[0], 10); // Convert to integer
        cy.log('Stock after adding to cart: ' + updatedStock);

        // Ensure stock decreased by 1
        expect(updatedStock).to.equal(initialStock - 1);
      }
    });
  });

  // Test case 2: Add item to cart and verify via API
  it('should add an item to cart and verify via API', () => {
    cy.request({
      method: 'POST',
      url: `/login`,
      body: {
        username: 'test2@test.fr',
        password: 'testtest'
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      let token = response.body.token;
      // Visit product page
      cy.get('.text-header > button').click(); // Open "Our Products" section
      cy.wait(['@getProducts']);
      cy.get(':nth-child(5) > .add-to-cart > [data-cy="product-link"]').click(); // Click consulter
      cy.wait(['@getProduct']);
      cy.get('[data-cy="detail-product-add"]')
        .scrollIntoView()
        .click(); // Click "Add to Cart"
      cy.wait(['@getCart']);

      // Verify cart content via API
      cy.request({
        method: 'GET',
        url: '/orders',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        const cart = response.body;
        cy.log(JSON.stringify(cart, null, 2)); // Log the cart object

        // Assertions for cart and product details
        expect(cart.orderLines).to.be.an('array').and.to.have.length.greaterThan(0);
        const product = cart.orderLines[0].product;
        expect(product.id).to.equal(10); // Check the product ID
        expect(product.name).to.equal('Aurore boréale');
      });
    });
  });

  // Test case 3: Verify that negative quantity is not allowed
  it('should not allow adding a negative quantity', () => {
    cy.get('.text-header > button').click(); // Open "Our Products" section
    cy.wait(['@getProduct'], { timeout: 10000 });
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]').click(); // Click to view product details

    // Step 2: Enter a negative quantity
    cy.get('[data-cy="detail-product-quantity"]').invoke('val', '-1').trigger('input');

    // Step 3: click on "add to cart"
    cy.get('[data-cy="detail-product-add"]').click(); // Click "Add to Cart"

    // Step 4: Verify that it doesn't redirect to the cart
    cy.url().should('not.include', '/cart')
  });


  // Test case 4: Verify that quantity greater than 20 is not allowed
  it('should not allow adding a quantity greater than 20', () => {
    cy.get('.text-header > button').click(); // Open "Our Products" section
    cy.wait(['@getProduct']);
    cy.get(':nth-child(8) > .add-to-cart > [data-cy="product-link"]').click(); // Click to view product details

    // Step 2: Enter an invalid quantity (greater than 20)
    cy.get('[data-cy="detail-product-quantity"]').clear().type('90');

    // Step 3: click on "add to cart"
    cy.get('[data-cy="detail-product-add"]').click(); // Click "Add to Cart"
    cy.wait(['@getCart']);
    // Step 4: Verify that it doesn't redirect to the cart
    cy.url().should('not.include', '/cart');
  });
});