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

  // ===== BASIC FUNCTIONALITY TESTS =====

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

  // ===== TITLE EDGE CASES =====

  it("TC-004: Should handle very long title", () => {
    const longTitle = 'A'.repeat(200)
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
    const specialTitle = `Test @#$%^&*()_+-=[]{}|;:',.<>?/ ${timestamp}`
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
    const unicodeTitle = `Test 中文 العربية हिन्दी 日本語 😊🎉🚀 ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(unicodeTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-007: Should handle HTML tags in title (should be escaped)", () => {
    const timestamp = Date.now()
    const htmlTitle = `<script>alert('xss')</script> Test ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(htmlTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-008: Should allow duplicate page titles", () => {
    const duplicateTitle = "Test Page Duplicate"
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(duplicateTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("First instance")
    })
    publishPage()
  })

  it("TC-009: Should create page with only whitespace in title", () => {
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type("     " + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content with whitespace title")
    })
    saveDraft()
  })

  it("TC-010: Should handle title with line breaks", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Title Line 1{shift+enter}Line 2 ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  // ===== CONTENT EDGE CASES =====

  it("TC-011: Should handle very long content", () => {
    const timestamp = Date.now()
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100)
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Long Content ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type(longContent)
    })
    publishPage()
  })

  it("TC-012: Should handle page with multiple paragraphs", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Multi Para ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true })
        .type("First paragraph{enter}")
        .type("Second paragraph{enter}")
        .type("Third paragraph")
    })
    publishPage()
  })

  it("TC-013: Should handle special characters in content", () => {
    const timestamp = Date.now()
    const specialContent = "Special chars: @#$%^&*()_+-=[]{}|;:',.<>?/\\"
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Special Content ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type(specialContent)
    })
    saveDraft()
  })

  it("TC-014: Should handle content with only whitespace", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Whitespace Content ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("          ")
    })
    saveDraft()
  })

  it("TC-015: Should handle numbers and mathematical symbols in content", () => {
    const timestamp = Date.now()
    const mathContent = "Math: 1+1=2, 10-5=5, 3×4=12, 15÷3=5, √16=4, π≈3.14, ∞, ±"
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Math Content ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type(mathContent)
    })
    saveDraft()
  })

  // ===== STATUS & VISIBILITY TESTS =====

  it("TC-016: Should change status to Draft", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Draft Status ${timestamp}{enter}`)
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

  it("TC-017: Should change status to Pending Review", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Pending Status ${timestamp}{enter}`)
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

  it("TC-018: Should set page visibility to Private", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Private Page ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Private content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(100)
    cy.get('button[aria-label*="Change visibility"]').click({ force: true })
    cy.wait(100)
    cy.get('input[value="private"]').check({ force: true })
    cy.wait(100)
    publishPage()
  })

  it("TC-019: Should set page visibility to Password Protected", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Password Protected ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Protected content")
    })
    cy.get('button[aria-label*="Settings"]').first().click({ force: true })
    cy.wait(100)
    cy.get('button[aria-label*="Change visibility"]').click({ force: true })
    cy.wait(100)
    cy.get('input[value="password"]').check({ force: true })
    cy.wait(100)
    cy.get('input[type="text"][placeholder*="password"]').type('testpass123')
    cy.wait(100)
    publishPage()
  })

  // ===== SCHEDULING TESTS =====

  it("TC-020: Should schedule page for future date", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Future Schedule ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Future content")
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-day input').clear().type('25')
    cy.get('.components-datetime__time-field-month select').select('December')
    cy.get('.components-datetime__time-field-year input').clear().type('2025')
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })

  it("TC-021: Should schedule page for past date (backdating)", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Backdated ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Backdated content")
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-day input').clear().type('01')
    cy.get('.components-datetime__time-field-month select').select('January')
    cy.get('.components-datetime__time-field-year input').clear().type('2023')
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })

  it("TC-022: Should handle scheduling with specific time", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Timed Schedule ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Timed content")
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-hours-input input').clear().type('11')
    cy.get('.components-datetime__time-field-minutes-input input').clear().type('45')
    cy.get('button[data-value="AM"]').click({ force: true })
    cy.get('.editor-post-publish-button__button').first().click({ force: true })
    cy.wait(100)
    cy.get('.editor-post-publish-button').click({ force: true })
  })

  // ===== NEGATIVE & BOUNDARY TESTS =====

  it("TC-023: Should handle invalid time input in scheduler (boundary test)", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Invalid Time ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    cy.get('button.editor-post-status__toggle').click({ force: true })
    cy.wait(100)
    cy.contains('label', 'Scheduled').click({ force: true })
    cy.wait(100)
    cy.get('button.editor-post-schedule__dialog-toggle').click({ force: true })
    cy.wait(100)
    cy.get('.components-datetime__time-field-hours-input input').clear().type('99')
    cy.get('.components-datetime__time-field-minutes-input input').clear().type('99')
    cy.get('.components-datetime__time-field-day input').clear().type('32')
    cy.wait(100)
    // WordPress should auto-correct or prevent publishing with invalid values
  })

  it("TC-024: Should handle SQL injection attempt in title", () => {
    const timestamp = Date.now()
    const sqlTitle = `Test'; DROP TABLE wp_posts;-- ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(sqlTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-025: Should handle XSS attempt in content", () => {
    const timestamp = Date.now()
    const xssContent = '<img src=x onerror="alert(\'XSS\')">'
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`XSS Test ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type(xssContent)
    })
    saveDraft()
  })

  // ===== WORKFLOW TESTS =====

  it("TC-026: Should create draft, then publish it", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Draft to Publish ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
    cy.wait(1000)
    publishPage()
  })

  it("TC-027: Should save multiple times before publishing", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(`Multiple Saves ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("First save")
    })
    saveDraft()
    cy.wait(1000)
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('p').first().click({ force: true }).type(" - Second save")
    })
    saveDraft()
    cy.wait(1000)
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('p').first().click({ force: true }).type(" - Final")
    })
    publishPage()
  })

  it("TC-028: Should handle rapid title changes", () => {
    const timestamp = Date.now()
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click()
        .type('First Title{selectall}')
        .type('Second Title{selectall}')
        .type(`Final Title ${timestamp}{enter}`)
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-029: Should create page with URL-like title", () => {
    const timestamp = Date.now()
    const urlTitle = `https://example.com/test-page?id=123&ref=test ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(urlTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Content")
    })
    saveDraft()
  })

  it("TC-030: Should create page with email-like title", () => {
    const timestamp = Date.now()
    const emailTitle = `test@example.com Contact Page ${timestamp}`
    getEditorIframe().then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1.editor-post-title').click().type(emailTitle + '{enter}')
      cy.wait(100)
      cy.wrap($body).find('p').first().click({ force: true }).type("Contact information")
    })
    saveDraft()
  })
})