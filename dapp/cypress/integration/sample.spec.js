describe("My First Test", () => {
  it('clicks the link "type"', () => {
    cy.visit("http://localhost:4000");
    cy.contains("Hello Svelte").click();
  });
});
