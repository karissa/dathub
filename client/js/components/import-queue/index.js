const html = require('choo/html')

module.exports = (state, prev, send) => {
  const writing = state.archive.importQueue.writing
  const writingProgressPct = state.archive.importQueue.writingProgressPct
  const next = state.archive.importQueue.next

  return _render()

  function _render () {
    if (writing || next.length > 0) {
      return html`<ul id="file-queue">
        ${writing ? _renderLi(writing, writingProgressPct) : undefined}
        ${next.map(function (file) {
          return _renderLi(file)
        })}
      </ul>`
    } else {
      return html`<ul id="file-queue"></ul>`
    }
  }

  function _renderLi (file, progressPct) {
    return html`<li>
      ${file.fullPath}
      ${_renderProgress(file, progressPct)}
    </li>`
  }

  function _renderProgress (file, progressPct) {
    if (file.writeError) {
      return html`<div class="progress error">Error</div>`
    }
    let loaded = 0
    let klass = 'progress__line--loading'
    if (progressPct) loaded = progressPct
    if (progressPct === 100) klass = 'progress__line--complete'
    return html`<div class="progress">
       <div class="progress__counter">${loaded}%</div>
       <div class="progress__bar">
         <div class="progress__line ${klass}"
              style="width: ${loaded}%">
         </div>
       </div>
     </div>`
  }
}