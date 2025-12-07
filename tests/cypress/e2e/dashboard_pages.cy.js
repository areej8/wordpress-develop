// Suppress ResizeObserver and block-editor errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop') || 
      err.message.includes('contentDocument') ||
      err.message.includes('documentElement')) {
    return false
  }
  return true
})

describe("WordPress Add Page Tests", () => {
  const USERNAME = Cypress.env('wpAdminUser')
  const PASSWORD = Cypress.env('wpAdminPass')


  beforeEach(() => {
    cy.visit("/wp-login.php")
    cy.get("body").should("be.visible")
    cy.get("#user_login")
      .clear({ force: true })
      .should("have.value", "")
      .wait(50)
      .type(USERNAME, { delay: 100 })
    cy.get("#user_pass")
      .clear({ force: true })
      .should("have.value", "")
      .wait(50)
      .type(PASSWORD, { 
        parseSpecialCharSequences: false,
        delay: 100
      })
    cy.get("#wp-submit").click()
    cy.url({ timeout: 10000 }).should("include", "/wp-admin")
    cy.get("#wpbody-content", { timeout: 10000 }).should("be.visible")
    cy.visit("/wp-admin/index.php")
    cy.get("#menu-pages").click()
    cy.contains("Add Page").click()
    cy.url().should("include", "post-new.php?post_type=page")
    cy.wait(1000)
    cy.get("body").then($body => {
      if ($body.find("button[aria-label='Close dialog']").length > 0) {
        cy.get("button[aria-label='Close dialog']").click()
      }
    })
    cy.wait(500)
  })

  afterEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  const getEditorIframe = () => {
    return cy.get('iframe[name="editor-canvas"]', { timeout: 10000 }).should('exist')
  }

  const publishPage = () => {
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(500)
    cy.get('.editor-post-publish-button').click({ force: true })
    cy.wait(1000)
  }

  const saveDraft = () => {
    cy.contains("button", "Save").click({ force: true })
    cy.wait(1000)
  }

  it("TC-001: Should create page with valid title and content", () => {
    const timestamp = Date.now()
    const pageTitle = `Test Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(pageTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("This is test content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(500)
    cy.get('button[aria-label*="Change status"]').click({ force: true })
    cy.wait(500)
    cy.get('input[value="private"]').check({ force: true })
    cy.wait(500)
    publishPage()
  })

  it("TC-002: Should create page with only title (no content) and schedule it", () => {
    const timestamp = Date.now()
    const pageTitle = `Minimal Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(pageTitle)
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(500)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(500)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(500)
    cy.get('.components-datetime__time-field-hours-input input').clear().type('03')
    cy.get('.components-datetime__time-field-minutes-input input').clear().type('30')
    cy.get('button[data-value="PM"]').click({ force: true })
    cy.get('.components-datetime__time-field-day input').clear().type('20')
    cy.get('.components-datetime__time-field-month select').select('December')
    cy.get('.components-datetime__time-field-year input').clear().type('2025')
    cy.wait(500)
    publishPage()
  })

  it("TC-003: Should handle empty title and show in drafts", () => {
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type('{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content without title")
    })
    saveDraft()
  })

  it("TC-004: Should handle very long title", () => {
    const timestamp = Date.now()
    const longTitle = 'A'.repeat(200) + ` ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(longTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content with very long title")
    })
    publishPage()
  })

  it("TC-005: Should handle special characters in title", () => {
    const timestamp = Date.now()
    const specialTitle = `Test @#$%^&*()_+-=[]{}|;:',.<>?/ ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(specialTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content with special chars")
    })
    saveDraft()
  })

  it("TC-006: Should handle unicode and emoji in title", () => {
    const timestamp = Date.now()
    const unicodeTitle = `Test 中文 العربية हिन्दी 😊🎉 ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(unicodeTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content with unicode")
    })
    saveDraft()
  })

  it("TC-007: Should handle HTML tags in title (should be escaped)", () => {
    const timestamp = Date.now()
    const htmlTitle = `<script>alert('xss')</script> Test ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(htmlTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content with HTML tags")
    })
    saveDraft()
  })

  it("TC-008: Should allow duplicate page titles", () => {
    const duplicateTitle = "Test Page Duplicate"
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(duplicateTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Duplicate title content")
    })
    publishPage()
  })

  it("TC-009: Should create page with only whitespace in title", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type("     " + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type(`Whitespace title content ${timestamp}`)
    })
    saveDraft()
  })

  it("TC-010: Should handle very long content", () => {
    const timestamp = Date.now()
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50)
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Long Content ${timestamp}{enter}`)
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type(longContent)
    })
    publishPage()
  })

  it("TC-011: Should handle page with multiple paragraphs", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Multi Para ${timestamp}{enter}`)
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true })
        .type("First paragraph{enter}")
        .wait(300)
        .type("Second paragraph{enter}")
        .wait(300)
        .type("Third paragraph")
    })
    publishPage()
  })

  it("TC-012: Should change status to Draft", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Draft Status ${timestamp}{enter}`)
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Draft content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(500)
    cy.get('button[aria-label*="Change status"]').click({ force: true })
    cy.wait(500)
    cy.get('input[value="draft"]').check({ force: true })
    cy.wait(500)
    cy.contains("button", "Save draft").click({ force: true })
    cy.wait(1000)
  })

  it("TC-013: Should change status to Pending Review", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Pending Status ${timestamp}{enter}`)
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Pending review content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(500)
    cy.get('button[aria-label*="Change status"]').click({ force: true })
    cy.wait(500)
    cy.get('input[value="pending"]').check({ force: true })
    cy.wait(500)
    saveDraft()
  })

  it("TC-014: Should schedule page for past date (backdating)", () => {
    const timestamp = Date.now()
    const pageTitle = `Backdated Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(pageTitle + '{enter}')
      cy.wait(500)
      cy.wrap($body).find('p').first().click({ force: true }).type("Backdated content")
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(500)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(500)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(500)
    cy.get('.components-datetime__time-field-hours-input input').clear().type('03')
    cy.get('.components-datetime__time-field-minutes-input input').clear().type('30')
    cy.get('button[data-value="PM"]').click({ force: true })
    cy.get('.components-datetime__time-field-day input').clear().type('20')
    cy.get('.components-datetime__time-field-month select').select('December')
    cy.get('.components-datetime__time-field-year input').clear().type('2023')
    cy.wait(500)
    publishPage()
  })
})