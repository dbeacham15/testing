import CATEGORIES from './categories'
import SUBCATEGORIES from './subcategories'

const generateRandomRevenueNumber = () => {
  const revenue = Math.random() * (500000 - 100) + 100

  return Math.floor(revenue)
}

const getSubCategoryForCategory = id => {
  const filteredSubs = Object.entries(SUBCATEGORIES).filter(subcat => {
    const key = subcat[0]
    const splitKey = key.split('-')

    return splitKey[0] === id
  })

  return filteredSubs.map(item => ({
    name: item[1],
    key: item[0],
    revenue: generateRandomRevenueNumber()
  }))
}

const categories = Object.entries(CATEGORIES).map(category => {
  return {
    name: category[1],
    key: category[0],
    children: getSubCategoryForCategory(category[0])
  }
})

export default {
  name: 'AdPod Item 1',
  children: categories
}
