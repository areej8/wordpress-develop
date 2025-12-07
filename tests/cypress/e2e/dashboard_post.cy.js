// tests/e2e/specs/03-posts/add-post-interactions.cy.js

// Suppress ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})

describe("WordPress Add Post - UI Interaction Tests", () => {
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
    
    // Navigate to dashboard
    cy.visit("/wp-admin/index.php")
    
    // Click on Posts menu
    cy.get("#menu-posts a").first().click()
    
    // Click on Add Post button
    cy.contains("Add Post").click()
  })

  afterEach(() => {
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


  /*it("Should clear and re-enter title", () => {
    const postTitle = `Test Post ${Date.now()}`
    cy.wait(50)
    cy.get('iframe[name="editor-canvas"]', { timeout: 150 }).should('exist')
    cy.get('iframe[name="editor-canvas"]').then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).find('h1').first().click().clear().type(postTitle)
    })
  })

  // ==================== CONTENT BLOCK INTERACTIONS ====================

  it("Should add paragraph block to post", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").type("This is a test paragraph content.")
  })

  it("Should add multiple paragraph blocks", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").type("First paragraph.{enter}{enter}Second paragraph.")
  })

  it("Should add heading block", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.get("button[aria-label='Add block']").click()
    cy.get("input[placeholder='Search']").type("heading")
    cy.contains("Heading").click()
    cy.get("h2").last().type("Heading Text")
  })

  it("Should add list block", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.get("button[aria-label='Add block']").click()
    cy.get("input[placeholder='Search']").type("list")
    cy.contains("List").click()
    cy.focused().type("List item 1{enter}List item 2{enter}List item 3")
  })

  it("Should add image block", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.get("button[aria-label='Add block']").click()
    cy.get("input[placeholder='Search']").type("image")
    cy.contains("Image").click()
  })

  it("Should add quote block", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.get("button[aria-label='Add block']").click()
    cy.get("input[placeholder='Search']").type("quote")
    cy.contains("Quote").click()
    cy.focused().type("This is a quote.")
  })

  // ==================== BLOCK MANIPULATION ====================

  it("Should delete a block", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("Content to delete")
    cy.get(".wp-block").first().click()
    cy.get("button[aria-label='Options']").click()
    cy.contains("Delete").click()
  })

  it("Should duplicate a block", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("Content to duplicate")
    cy.get(".wp-block").first().click()
    cy.get("button[aria-label='Options']").click()
    cy.contains("Duplicate").click()
  })

  it("Should move block up", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("First block{enter}{enter}Second block")
    cy.get(".wp-block").last().click()
    cy.get("button[aria-label='Move up']").click()
  })

  it("Should move block down", () => {
    cy.wait(2000)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("First block{enter}{enter}Second block")
    cy.get(".wp-block").first().click()
    cy.get("button[aria-label='Move down']").click()
  })

  // ==================== CATEGORY INTERACTIONS ====================

  it("Should select Uncategorized category", () => {
    cy.wait(2000)
    cy.contains("Categories").click()
    cy.get("input[type='checkbox']").first().check()
  })

  it("Should add new category", () => {
    const categoryName = `Category ${Date.now()}`
    cy.wait(2000)
    cy.contains("Categories").click()
    cy.contains("Add New Category").click()
    cy.get("input[type='text']").last().type(categoryName)
    cy.contains("Add New Category").last().click()
  })

  // ==================== TAG INTERACTIONS ====================

  it("Should add tags to post", () => {
    cy.wait(2000)
    cy.contains("Tags").click()
    cy.get("input[placeholder='Add New Tag']").type("tag1{enter}")
    cy.get("input[placeholder='Add New Tag']").type("tag2{enter}")
    cy.get("input[placeholder='Add New Tag']").type("tag3{enter}")
  })

  it("Should remove a tag", () => {
    cy.wait(2000)
    cy.contains("Tags").click()
    cy.get("input[placeholder='Add New Tag']").type("testtag{enter}")
    cy.get("button[aria-label='Remove tag']").first().click()
  })

  // ==================== FEATURED IMAGE INTERACTIONS ====================

  it("Should open featured image dialog", () => {
    cy.contains("Set featured image").click()
  })

  // ==================== EXCERPT INTERACTIONS ====================

  it("Should add excerpt to post", () => {
    cy.contains("Add an excerpt").click()
    cy.get("textarea[placeholder*='excerpt']").type("This is a post excerpt for testing purposes.")
  })

  // ==================== DISCUSSION INTERACTIONS ====================

  it("Should toggle discussion settings", () => {
    cy.get(".components-panel__body").contains("Discussion").click()
    cy.get("input[type='checkbox']").first().click()
  })

  // ==================== SAVE DRAFT INTERACTION ====================

  it("Should save post as draft", () => {
    const postTitle = `Draft Post ${Date.now()}`
    cy.wait(2000)
    cy.get("h1[aria-label='Add title']").click().type(postTitle)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("Draft content")
    cy.contains("Save draft").click()
  })

  // ==================== PUBLISH INTERACTIONS ====================

  it("Should open publish panel", () => {
    const postTitle = `Publish Test ${Date.now()}`
    cy.wait(2000)
    cy.get("h1[aria-label='Add title']").click().type(postTitle)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("Content for publishing")
    cy.contains("Publish").click()
  })

  it("Should publish a post", () => {
    const postTitle = `Published Post ${Date.now()}`
    cy.wait(2000)
    cy.get("h1[aria-label='Add title']").click().type(postTitle)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("Published content")
    cy.contains("Publish").click()
    cy.get("button[aria-label='Publish']").click()
  })

  // ==================== PREVIEW INTERACTION ====================

  it("Should open preview", () => {
    const postTitle = `Preview Test ${Date.now()}`
    cy.wait(2000)
    cy.get("h1[aria-label='Add title']").click().type(postTitle)
    cy.get("p[aria-label='Empty block; start writing or type forward slash to choose a block']").click()
    cy.focused().type("Preview content")
    cy.get("button[aria-label='Preview']").click()
  })

  // ==================== SETTINGS SIDEBAR TOGGLE ====================

  it("Should toggle settings sidebar", () => {
    cy.wait(2000)
    cy.get("button[aria-label='Settings']").click()
    cy.get("button[aria-label='Settings']").click()
  })

  it("Should switch between Post and Block tabs", () => {
    cy.wait(2000)
    cy.contains("Post").click()
    cy.contains("Block").click()
  })*/

})