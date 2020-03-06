import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'

const Treemap = props => {
  const { data, width, height } = props
  const colorDomain = [-0.1, 0, 0.1]
  const colorRange = [props.minColor, props.midColor, props.maxColor]

  const mapRef = useRef()
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
  const svgWidth = width - margin.left - margin.right
  const svgHeight = height - margin.top - margin.bottom
  const color = d3.scaleOrdinal(colorRange)

  const x = d3.scaleLinear().rangeRound([0, svgWidth])
  const y = d3.scaleLinear().rangeRound([0, svgHeight])

  const parsedData = data =>
    d3
      .hierarchy(data)
      .sum(data => data.revenue)
      .sort((a, b) => b.revenue - a.revenue)

  const treemap = data =>
    d3
      .treemap()
      .size([svgWidth, svgHeight])
      .padding(1)
      .round(true)(parsedData(data))

  const root = treemap(data)

  // Creates thebase SVG for the Treemap
  const createSvgForREf = () => {
    const svg = d3
      .select(mapRef.current)
      .append('svg')
      .attr('width', svgWidth + margin.left + margin.right)
      .attr('height', svgHeight + margin.top + margin.bottom)
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const cells = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`)

    cells
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        while (d.depth > 1) {
          d = d.parent
        }

        return color(d.data.name)
      })

    //debugger
    //group = svg.append('g').call(render, treemap(root))
  }

  useEffect(() => {
    if (!mapRef.current) {
      return
    }

    const drawMap = () => {
      createSvgForREf()
    }

    drawMap()
  }, [mapRef])

  return <div className='feature' ref={mapRef}></div>
}

Treemap.defaultProps = {
  height: 1000,
  minColor: '#ccdcf8',
  midColor: '#ddd',
  maxColor: '#548bea',
  width: 1000
}

Treemap.propTypes = {
  data: PropTypes.shape().isRequired,
  height: PropTypes.number,
  minColor: PropTypes.string,
  midColor: PropTypes.string,
  maxColor: PropTypes.string,
  width: PropTypes.number
}
export default Treemap
