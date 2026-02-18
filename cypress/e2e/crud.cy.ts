describe('OpenSearch Dashboards CRUD Plugin', () => {
  const entityName = 'Test Entity ' + Date.now();
  const updatedName = entityName + ' Updated';

  beforeEach(() => {
    // Programmatic login
    cy.login('admin', 'admin');
    // Navigate to the plugin page
    // The plugin ID is 'osdCrud' based on opensearch_dashboards.json
    cy.visit('/app/osdCrud');
  });

  it('should perform full CRUD lifecycle', () => {
    // CREATE
    cy.get('[data-test-subj="createEntityButton"]').click();
    cy.get('[data-test-subj="entityNameInput"]').type(entityName);
    cy.get('[data-test-subj="entityDescriptionInput"]').type('This is a test entity');
    cy.get('[data-test-subj="submitEntityButton"]').click();

    // READ
    cy.contains(entityName).should('be.visible');

    // UPDATE
    // Find the row with our entity and click edit
    cy.contains('tr', entityName).find('[data-test-subj="editEntityButton"]').click();
    cy.get('[data-test-subj="entityNameInput"]').clear().type(updatedName);
    cy.get('[data-test-subj="submitEntityButton"]').click();

    // Verify update
    cy.contains(updatedName).should('be.visible');
    cy.contains(entityName).should('not.exist');

    // DELETE
    cy.contains('tr', updatedName).find('[data-test-subj="deleteEntityButton"]').click();
    // If there's a confirmation modal, we might need to click confirm
    // Assuming a simple confirm for now, or direct deletion
    // cy.get('[data-test-subj="confirmModalConfirmButton"]').click();

    // Verify deletion
    cy.contains(updatedName).should('not.exist');
  });
});
