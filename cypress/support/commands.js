// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })`
Cypress.Commands.add("login", (username, password) => {
  cy.session([username, password], () => {
    cy.visit("http://114.4.135.141:17003/olibsbesy/WndLogin.zul");
    cy.get("input.z-textbox").eq(0).type(username);
    cy.get("input.z-textbox").eq(1).type(password);
    cy.get("td.z-button-cm").eq(0).click();
  });
});
