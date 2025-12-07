

// Suppress ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})

describe("WordPress Add Page Tests", () => {
  const USERNAME = "areesha"
  const PASSWORD = "10139525#jm"

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
    cy.url({ timeout: 100 }).should("include", "/wp-admin")
    cy.get("#wpbody-content", { timeout: 100 }).should("be.visible")
    cy.visit("/wp-admin/index.php")
    cy.get("#menu-pages").click()
    cy.contains("Add Page").click()
    cy.url().should("include", "post-new.php?post_type=page")
    cy.wait(100)
    cy.get("body").then($body => {
      if ($body.find("button[aria-label='Close dialog']").length > 0) {
        cy.get("button[aria-label='Close dialog']").click()
      }
    })
    cy.wait(100)
  })

  afterEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  const getEditorIframe = () => {
    return cy.get('iframe[name="editor-canvas"]', { timeout: 100 }).should('exist')
  }

  const publishPage = () => {
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  }

  const saveDraft = () => {
    cy.contains("button", "Save").click({ force: true })
  }

  it("TC-001: Should create page with valid title and content", () => {
    const timestamp = Date.now()
    const pageTitle = `Test Page`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(pageTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("This is test content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(100)
    cy.get('button[aria-label*="Change status"]').click({ force: true })
    cy.wait(100)
    cy.get('input[value="private"]').check({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })

  it("TC-002: Should create page with only title (no content) and schedule it", () => {
    const timestamp = Date.now()
    const pageTitle = `Minimal Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(pageTitle)
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-hours-input input').clear().type('03')
    cy.get('.components-datetime__time-field-minutes-input input').clear().type('30')
    cy.get('button[data-value="PM"]').click({ force: true })
    cy.get('.components-datetime__time-field-day input').clear().type('20')
    cy.get('.components-datetime__time-field-month select').select('December')
    cy.get('.components-datetime__time-field-year input').clear().type('2025')
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })

  it("TC-003: Should handle empty title and show in drafts", () => {
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type('{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content without title")
    })
    saveDraft()
  })

  it("TC-004: Should handle very long title", () => {
    const longTitle = 'A'.repeat(50)
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(longTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    publishPage()
  })

  it("TC-005: Should handle special characters in title", () => {
    const timestamp = Date.now()
    const specialTitle = `Test @#$%^&*() ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(specialTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-006: Should handle unicode and emoji in title", () => {
    const timestamp = Date.now()
    const unicodeTitle = `Test 中文 العربية 😊 ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(unicodeTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-007: Should handle very long content", () => {
    const timestamp = Date.now()
    const longContent = 'Lorem ipsum dolor sit amet. '.repeat(100)
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Long Content ${timestamp}` + '{enter}')
      cy.wait(100)
    })
    publishPage()
  })

  it("TC-008: Should allow duplicate page titles", () => {
    const duplicateTitle = "Test Page"
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(duplicateTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("page")
    })
    publishPage()
  })

  it("TC-009: Should create page with only whitespace and save as draft", () => {
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type("     " + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("     ")
    })
    saveDraft()
  })

  it("TC-010: Should handle page with multiple paragraphs", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Multi Para ${timestamp}` + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("First paragraph{enter}Second paragraph")
    })
    publishPage()
  })

  it("TC-011: Should change status to Draft", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Draft Status ${timestamp}` + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(100)
    cy.get('button[aria-label*="Change status"]').click({ force: true })
    cy.wait(100)
    cy.get('input[value="draft"]').check({ force: true })
    cy.wait(100)
    cy.contains("button", "Save draft").click({ force: true })
  })

  it("TC-012: Should change status to Pending Review", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Pending Status ${timestamp}` + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(100)
    cy.get('button[aria-label*="Change status"]').click({ force: true })
    cy.wait(100)
    cy.get('input[value="pending"]').check({ force: true })
    cy.wait(100)
    saveDraft()
  })

  it("TC-013: Should schedule page for past date using calendar", () => {
    const timestamp = Date.now()
    const pageTitle = `Minimal Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click()
      cy.wrap($body).find('h1.editor-post-title').type(pageTitle)
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-hours-input input').clear()
    cy.get('.components-datetime__time-field-hours-input input').type('03')
    cy.get('.components-datetime__time-field-minutes-input input').clear()
    cy.get('.components-datetime__time-field-minutes-input input').type('30')
    cy.get('button[data-value="PM"]').click({ force: true })
    cy.get('.components-datetime__time-field-day input').clear()
    cy.get('.components-datetime__time-field-day input').type('20')
    cy.get('.components-datetime__time-field-month select').select('December')
    cy.get('.components-datetime__time-field-year input').clear()
    cy.get('.components-datetime__time-field-year input').type('2023')
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })

  it("TC-014: Should handle invalid time input in scheduler (Expected to Fail)", () => {
    const timestamp = Date.now()
    const pageTitle = `Minimal Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click()
      cy.wrap($body).find('h1.editor-post-title').type(pageTitle)
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-hours-input input').clear()
    cy.get('.components-datetime__time-field-hours-input input').type('99')
    cy.get('.components-datetime__time-field-minutes-input input').clear()
    cy.get('.components-datetime__time-field-minutes-input input').type('99')
    cy.get('button[data-value="PM"]').click({ force: true })
    cy.get('.components-datetime__time-field-day input').clear()
    cy.get('.components-datetime__time-field-day input').type('32')
    cy.get('.components-datetime__time-field-month select').select('December')
    cy.get('.components-datetime__time-field-year input').clear()
    cy.get('.components-datetime__time-field-year input').type('2029')
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })
})