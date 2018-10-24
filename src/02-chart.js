import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 10, left: 10, right: 10, bottom: 10 }

let height = 300 - margin.top - margin.bottom
let width = 700 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
var graticule = d3.geoGraticule()
let colorScale = d3.scaleOrdinal().range(['brown', 'green', 'red'])
let path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.json(require('./data/railway.topojson'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([world, railway]) {
  let countries = topojson.feature(world, world.objects.countries)
  let trains = topojson.feature(railway, railway.objects.railways)

  projection.fitSize([width, height], trains)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('class', 'sphere')
    .attr('fill', '#a3cdd6')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)

  svg
    .append('path')
    .datum(graticule())
    .attr('class', 'graticule')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('opacity', 0.5)
    .attr('stroke-width', 1)

  var passthrough = [
    'Russian Federation',
    'France',
    'Belarus',
    'China',
    'Germany',
    'Poland',
    'Kazakhstan',
    'Spain'
  ]

  svg
    .append('g')
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', d => {
      if (passthrough.indexOf(d.properties.name) !== -1) {
        return '#faf7eb'
      } else {
        return '#e9e3c8'
      }
    })
    .attr('stroke', 'black')
    .attr('stroke-width', 0.25)

  svg
    .selectAll('.train')
    .data(trains.features)
    .enter()
    .append('path')
    .attr('class', 'train')
    .attr('id', d => {
      var cleanedName = d.properties.name.replace(/ /g, '-')
      return cleanedName
    })
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', d => colorScale(d.properties.name))
    .attr('stroke-width', 3)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')

  svg
    .selectAll('.train-label')
    .data(trains.features)
    .enter()
    .append('text')
    .text(d => d.properties.name)
    .attr('transform', d => `translate(${path.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('class', 'train-label')
    .attr('font-size', 16)
    .attr('dy', d => {
      if (d.properties.name === 'Trans-Siberian Railway') {
        return -10
      }
    })
    .style(
      'text-shadow',
      '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF'
    )

  d3.select('.moscow-beijing-text')
    .style('background', colorScale('Moscow-to-Beijing Train'))
  d3.select('.trans-siberian-text')
    .style('background', colorScale('Trans-Siberian Railway'))
  d3.select('.block-train-text')
    .style('background', colorScale('China-Europe Block Train'))

}
