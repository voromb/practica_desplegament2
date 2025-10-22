describe('Basic test', () => {
  it('should load the homepage', () => {
    cy.visit('http://localhost:3050')
    cy.contains('Get started by editing')
  })
})