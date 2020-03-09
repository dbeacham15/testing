import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
/**
 *
 * THINGS left to do
 *
 * Fix Header
 * TRuncate the Text in the Labels and style that shit
 * Tooltips
 */

// @ref https://observablehq.com/@d3/zoomable-treemap
const Treemap = props => {
  const { data, width, height } = props
  const colorDomain = [-0.1, 0, 0.1]
  const colorRange = [props.minColor, props.midColor, props.maxColor]
  let group, svg
  let currentDepth
  const mapRef = useRef()
  const margin = {
    top: 60,
    right: 20,
    bottom: 20,
    left: 20
  }
  const svgWidth = width - margin.left - margin.right
  const svgHeight = height - margin.top - margin.bottom
  const color = d3.scaleOrdinal(colorRange)

  const x = d3
    .scaleLinear()
    .domain([0, width])
    .range([0, width])
  const y = d3
    .scaleLinear()
    .domain([0, height])
    .range([0, height])

  const tile = (node, x0, y0, x1, y1) => {
    d3.treemapBinary(node, 0, 0, width, height)
    for (const child of node.children) {
      child.x0 = x0 + (child.x0 / width) * (x1 - x0)
      child.x1 = x0 + (child.x1 / width) * (x1 - x0)
      child.y0 = y0 + (child.y0 / height) * (y1 - y0)
      child.y1 = y0 + (child.y1 / height) * (y1 - y0)
    }
  }

  const parsedData = data =>
    d3
      .hierarchy(data)
      .sum(data => data.revenue)
      .sort((a, b) => b.revenue - a.revenue)

  const treemap = data =>
    d3
      .treemap()
      .tile(tile)
      .size([svgWidth, svgHeight])
      .round(true)(parsedData(data))

  const position = (group, root) => {
    group
      .selectAll('g')
      .attr('transform', d =>
        d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`
      )
      .select('rect')
      .attr('width', d => (d === root ? width : x(d.x1) - x(d.x0)))
      .attr('height', d => (d === root ? 30 : y(d.y1) - y(d.y0)))
      .style('fill', d => color(d.data.name))
      .attr('fill-opacity', '0.8')
  }

  const name = d =>
    d
      .ancestors()
      .reverse()
      .map(d => d.data.name)
      .join('/')

  const render = (group, root) => {
    const node = group
      .selectAll('g')
      .data(root.children.concat(root))
      .join('g')

    // Zoom Functions
    node
      .filter(d => (d === root ? d.parent : d.children))
      .attr('cursor', 'pointer')
      .on('click', d => (d === root ? zoomout(root) : zoomin(d)))

    node.append('title').text(d => `${d.data.name}`)

    node
      .append('rect')
      .attr('fill', d => (d === root ? '#fff' : d.children ? '#ccc' : '#ddd'))
      .attr('stroke', '#fff')

    node
      .append('text')
      .attr('x', 8)
      .attr('y', 16)
      .text(d => d.data.name)
      .append('clipPath')

    group.call(position, root)
  }

  const zoomin = d => {
    const group0 = group.attr('pointer-events', 'none')
    const group1 = (group = svg.append('g').call(render, d))

    x.domain([d.x0, d.x1])
    y.domain([d.y0, d.y1])
    currentDepth = d
    svg
      .transition()
      .duration(750)
      .call(t =>
        group0
          .transition(t)
          .remove()
          .call(position, d.parent)
      )
      .call(t =>
        group1
          .transition(t)
          .attrTween('opacity', () => d3.interpolate(0, 1))
          .call(position, d)
      )
  }

  // Make active depth a state for better react management
  const zoomout = d => {
    const group0 = group.attr('pointer-events', 'none')
    const group1 = (group = svg.insert('g', '*').call(render, d.parent))

    x.domain([d.parent.x0, d.parent.x1])
    y.domain([d.parent.y0, d.parent.y1])
    currentDepth = d.parent
    svg
      .transition()
      .duration(750)
      .call(t =>
        group0
          .transition(t)
          .remove()
          .attrTween('opacity', () => d3.interpolate(1, 0))
          .call(position, d)
      )
      .call(t => group1.transition(t).call(position, d.parent))
  }

  const buildCellsForSvg = () => {
    const root = treemap(data)
    group = svg.append('g').call(render, root)
  }

  // Creates thebase SVG for the Treemap
  const createSvgForREf = () => {
    svg = d3
      .select(mapRef.current)
      .append('svg')
      .attr('width', svgWidth + margin.left + margin.right)
      .attr('height', svgHeight + margin.top + margin.bottom)
      .attr('transform', `translate(${margin.left},${margin.top})`)

    buildCellsForSvg()
  }

  useEffect(() => {
    if (!mapRef.current) {
      return
    }

    const drawMap = () => {
      createSvgForREf()
      mapRef.current.addEventListener('contextmenu', evt => {
        evt.preventDefault()
        if (currentDepth && currentDepth.parent) {
          zoomout(currentDepth)
        }
      })
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
