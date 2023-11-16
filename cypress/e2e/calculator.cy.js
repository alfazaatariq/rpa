describe("Calculator.net", () => {
  const json = Cypress.env("json");

  beforeEach(() => {
    cy.fixture(json).as("data");
    cy.visit("/"); // Dynamic URL
  });

  it("Dynamic Test", () => {
    cy.get("@data").each((data) => {
      let result = {
        web: "",
        input: {},
        output: {},
        created_by: "",
        updated_by: "",
      };
      Object.entries(data).forEach(([key, value], index) => {
        result.input[key] = value;

        cy.get(`[name="${key}"], [id="${key}"]`).then(($element) => {
          const elementType = $element.prop("type");

          switch (elementType) {
            case "text":
              cy.task("log", "TYPE ELEMENT INI ADALAH TEXT");

              // Check if this is the last iteration
              if (index === Object.entries(data).length - 1) {
                cy.task("log", "This is the last iteration of the loop");

                cy.get(`[name="${key}"], [id="${key}"]`)
                  .clear({ force: true })
                  .type(`${value} {enter}`);

                result.web = Cypress.config().baseUrl;
                cy.get(".h2result")
                  .invoke("text")
                  .then((innerText) => {
                    cy.get(".h2result")
                      .nextAll()
                      .invoke("text")
                      .then((outerTextArray) => {
                        result.output = {
                          output: `${innerText} ${outerTextArray}`,
                        };
                      });
                  });

                result.created_by = "user@email.com";
                result.updated_by = "user@email.com";

                cy.request({
                  method: "POST",
                  url: "http://localhost:3000/log",
                  body: result,
                  headers: { "Content-Type": "application/json" },
                }).then((response) => {
                  if (response.status === 200) {
                    console.log("API CALL SUCCESS!");
                    return;
                  } else {
                    throw new Error("API call failed");
                  }
                });
              }

              cy.get(`[name="${key}"], [id="${key}"]`)
                .clear({ force: true })
                .type(value);

              break;

            case "radio":
              cy.task("log", "TYPE ELEMENT INI ADALAH RADIO");
              if (index === Object.entries(data).length - 1) {
                cy.task("log", "This is the last iteration of the loop");
                // cy.get(`label[for="${key}"]`).click().type("{enter}");
                cy.get(`[value='${value}']`)
                  .invoke("width", "1px")
                  .invoke("height", "1px")
                  .should("have.css", "width", "1px")
                  .should("have.css", "height", "1px")
                  .eq(0)
                  .click()
                  .type("{enter}");
                cy.get(".h2result")
                  .invoke("text")
                  .then((innerText) => {
                    cy.get(".h2result")
                      .nextAll()
                      .invoke("text")
                      .then((outerTextArray) => {
                        result.output = {
                          output: `${innerText} ${outerTextArray}`,
                        };
                      });
                  });
                result.web = Cypress.config().baseUrl;

                result.created_by = "user@email.com";
                result.updated_by = "user@email.com";

                cy.request({
                  method: "POST",
                  url: "http://localhost:3000/log",
                  body: result,
                  headers: { "Content-Type": "application/json" },
                }).then((response) => {
                  if (response.status === 200) {
                    console.log("API CALL SUCCESS!");
                    return;
                  } else {
                    throw new Error("API call failed");
                  }
                });
              }
              // cy.get(`label[for="${key}"]`).click();
              cy.get(`[value='${value}']`)
                .invoke("width", "1px")
                .invoke("height", "1px")
                .should("have.css", "width", "1px")
                .should("have.css", "height", "1px")
                .eq(0)
                .click();
              break;

            case "checkbox":
              cy.task("log", "TYPE ELEMENT INI ADALAH CHECKBOX");
              if (index === Object.entries(data).length - 1) {
                cy.task("log", "This is the last iteration of the loop");
                // cy.get(`label[for="${key}"]`).click().type("{enter}");
                cy.get(`[value='${value}']`)
                  .invoke("width", "1px")
                  .invoke("height", "1px")
                  .should("have.css", "width", "1px")
                  .should("have.css", "height", "1px")
                  .eq(0)
                  .click()
                  .type("{enter}");
                cy.get(".h2result")
                  .invoke("text")
                  .then((innerText) => {
                    cy.get(".h2result")
                      .nextAll()
                      .invoke("text")
                      .then((outerTextArray) => {
                        result.output = {
                          output: `${innerText} ${outerTextArray}`,
                        };
                      });
                  });
                result.web = Cypress.config().baseUrl;

                result.created_by = "user@email.com";
                result.updated_by = "user@email.com";

                cy.request({
                  method: "POST",
                  url: "http://localhost:3000/log",
                  body: result,
                  headers: { "Content-Type": "application/json" },
                }).then((response) => {
                  if (response.status === 200) {
                    console.log("API CALL SUCCESS!");
                    return;
                  } else {
                    throw new Error("API call failed");
                  }
                });
              }
              // cy.get(`label[for="${key}"]`).click();
              cy.get(`[value='${value}']`)
                .invoke("width", "1px")
                .invoke("height", "1px")
                .should("have.css", "width", "1px")
                .should("have.css", "height", "1px")
                .eq(0)
                .click();

              break;

            case "select-one":
              cy.task("log", "TYPE ELEMENT INI ADALAH SELECT");

              // Handling the last iteration
              if (index === Object.entries(data).length - 1) {
                cy.task("log", "This is the last iteration of the loop");

                cy.get(`[name="${key}"], [id="${key}"]`)
                  .select(value)
                  .type("{enter}");
                cy.get(".h2result")
                  .invoke("text")
                  .then((innerText) => {
                    cy.get(".h2result")
                      .nextAll()
                      .invoke("text")
                      .then((outerTextArray) => {
                        result.output = {
                          output: `${innerText} ${outerTextArray}`,
                        };
                      });
                  });
                result.web = Cypress.config().baseUrl;

                result.created_by = "user@email.com";
                result.updated_by = "user@email.com";

                cy.request({
                  method: "POST",
                  url: "http://localhost:3000/log",
                  body: result,
                  headers: { "Content-Type": "application/json" },
                }).then((response) => {
                  if (response.status === 200) {
                    console.log("API CALL SUCCESS!");
                    return;
                  } else {
                    throw new Error("API call failed");
                  }
                });
              }

              cy.get(`[name="${key}"], [id="${key}"]`).select(value);

              break;

            default:
              cy.task("log", `TYPE ELEMENT INI ADALAH ${elementType}`);
              break;
          }
        });
      });
    });
  });
});
