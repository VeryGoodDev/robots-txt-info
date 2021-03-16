const input = document.querySelector(`.input`)
const output = document.querySelector(`.output`)
const parseBtn = document.querySelector(`.parse-btn`)
const siteInfoEl = output.querySelector(`.site-info`)
const userAgentsTable = output.querySelector(`.user-agents`)

parseBtn.addEventListener(`click`, handleParseClick)

const userAgentDirectives = [`allow`, `disallow`, `crawl-delay`]

// Main functions
function handleParseClick() {
  const parsed = parseInput(input.value)
  updateSiteInfo(parsed.siteInfo)
  updateUserAgents(parsed.userAgents)
}
function parseInput(rawText) {
  const lines = rawText.split(`\n`).filter((line) => line.length && !line.startsWith(`#`))
  const siteInfo = {
    sitemaps: [],
  }
  const userAgents = {}
  let currentUserAgent
  lines.forEach((line) => {
    const [directiveRaw, value] = line.split(/:\s*/)
    const directive = directiveRaw.toLowerCase()
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
      } else {
        userAgents[currentUserAgent][directiveRaw] = value
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
function updateUserAgents(userAgents) {}

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
