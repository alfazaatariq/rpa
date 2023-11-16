describe("Inquiry", () => {
  const json = Cypress.env("json");

  beforeEach(() => {
    cy.fixture(json).as("data");
    cy.visit("http://114.4.135.141:17003/olibsbesy/WndMenu.zul");
  });

  it("Inquiry Rekap Rekening Pembiayaan Per Nasabah", () => {
    cy.visit("http://114.4.135.141:17003/olibsbesy/WndMenu.zul");

    cy.get("@data").each((data) => {
      const inquiryMenu = `div[id$="bc-cave"]`;
      cy.get(inquiryMenu).click();

      const inquiryRekapRekeningPembiayaanPerNasabah = `div[id$="oc-cave"]`;
      cy.get(inquiryRekapRekeningPembiayaanPerNasabah).dblclick();

      const no_cif = `input[id$="_m"]`;
      cy.get(no_cif).type(`${data.no_cif} {enter}`);
      const error = `div.z-popup-cm`;

      cy.get(error).should("not.be.visible"); // Wait for up to 5 seconds
    });
  });
});
