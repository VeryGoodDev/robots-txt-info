const input = document.querySelector(`.input`)
const output = document.querySelector(`.output`)
const parseBtn = document.querySelector(`.parse-btn`)
const siteInfoEl = output.querySelector(`.site-info`)
const userAgentsTable = output.querySelector(`.user-agents tbody`)

parseBtn.addEventListener(`click`, handleParseClick)

const userAgentDirectives = [`allow`, `disallow`, `crawl-delay`]

// Main functions
function handleParseClick() {
  const parsed = parseInput(input.value)
  updateSiteInfo(parsed.siteInfo)
  updateUserAgents(parsed.userAgents)
  console.log(parsed.userAgents)
}
function parseInput(rawText) {
  const lines = rawText.split(`\n`).filter((line) => line.length && !line.startsWith(`#`))
  const siteInfo = {
    sitemaps: [],
  }
  const userAgents = {}
  let currentUserAgent
  lines.forEach((line) => {
    const [directiveRaw, ...valueRaw] = line.split(/:\s*/)
    const directive = directiveRaw.toLowerCase()
    const value = valueRaw.join(`:`)
    if (directive === `user-agent`) {
      currentUserAgent = value
      if (!userAgents[currentUserAgent]) {
        userAgents[currentUserAgent] = getUserAgentEntry()
      }
    } else if (userAgentDirectives.includes(directive)) {
      if (directive === `allow`) {
        userAgents[currentUserAgent].allow.push(value)
      } else if (directive === `disallow`) {
        userAgents[currentUserAgent].disallow.push(value)
      } else if (directive === `crawl-delay`) {
        userAgents[currentUserAgent].crawlDelay = value
      } else {
        userAgents[currentUserAgent][directive] = value
      }
    } else if (directive === `sitemap`) {
      siteInfo.sitemaps.push(value)
    } else {
      siteInfo[directiveRaw] = value
    }
  })
  return { siteInfo, userAgents }
}
function updateSiteInfo(siteInfo) {
  if (isEmpty(siteInfo)) return
  siteInfoEl.innerHTML = ``
  Object.entries(siteInfo).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && !value.length)) return
    const item = document.createElement(`div`)
    item.classList.add(`site-info-item`)
    const strong = document.createElement(`strong`)
    strong.textContent = `${key}:`
    const valueIsLink = /^https?:\/\//.test(value)
    const valueEl = document.createElement(valueIsLink ? `a` : `span`)
    valueEl.textContent = value
    if (valueIsLink) {
      valueEl.href = value
      valueEl.target = `_blank`
      valueEl.rel = `noopener noreferrer`
    }
    item.appendChild(strong)
    item.appendChild(valueEl)
    siteInfoEl.appendChild(item)
  })
}
function updateUserAgents(userAgents) {
  Object.entries(userAgents).forEach(([userAgent, { allow, disallow, crawlDelay }]) => {
    const row = document.createElement(`tr`)
    const userAgentTd = document.createElement(`td`)
    userAgentTd.textContent = userAgent
    const allowTd = document.createElement(`td`)
    if (allow.length) {
      allowTd.innerHTML = allow
        .map((url) => {
          const span = document.createElement(`span`)
          span.classList.add(`url`)
          span.textContent = url
          return span.outerHTML
        })
        .join(``)
    }
    const disallowTd = document.createElement(`td`)
    if (disallow.length) {
      disallowTd.innerHTML = disallow
        .map((url) => {
          const span = document.createElement(`span`)
          span.classList.add(`url`)
          span.textContent = url
          return span.outerHTML
        })
        .join(``)
    }
    const crawDelayTd = document.createElement(`td`)
    crawDelayTd.textContent = crawlDelay ?? ``
    row.appendChild(userAgentTd)
    row.appendChild(allowTd)
    row.appendChild(disallowTd)
    row.appendChild(crawDelayTd)
    userAgentsTable.appendChild(row)
  })
}

// Helper functions
function getUserAgentEntry() {
  return {
    allow: [],
    disallow: [],
  }
}
function isEmpty(siteInfo) {
  return !siteInfo || !Object.keys(siteInfo).length
}
