import alasql from "alasql";

export const IDENTIFIER = 'indicator_'
export const JOIN_IDENTIFIER = 'geometry_code'

/** TYPE WHERE SECTION */
export const TYPE = {
  GROUP: 'GROUP',
  EXPRESSION: 'EXPRESSION'
}

// TODO We need to do it in elegant way
//  This is matching the key on OPERATOR
export const IS_NULL = 'IS NULL'
export const IS_NOT_NULL = 'IS NOT NULL'
export const IS_IN = 'IN'
export const OPERATOR = {
  'IN': 'is any of',
  '=': 'is equal',
  '>': 'is more than',
  '>=': 'is more and equal',
  '<': 'is less than',
  '<=': 'is less and equal',
  'IS NULL': 'is null',
  'IS NOT NULL': 'is not null',
}

/** OPERATOR BETWEEN WHERE */
export const WHERE_OPERATOR = {
  AND: 'AND',
  OR: 'OR'
}

/** INIT DATA */
export const INIT_DATA = {
  GROUP: () => {
    return Object.assign({}, {
      type: TYPE.GROUP,
      operator: WHERE_OPERATOR.AND,
      queries: []
    })
  },
  WHERE: () => {
    return Object.assign({}, {
      field: '',
      operator: '=',
      whereOperator: WHERE_OPERATOR.AND,
      type: TYPE.EXPRESSION
    })
  }
}

/**
 * Return indicator query
 * @param {array} indicatorData
 */
export function queryIndicator(indicatorData) {
  return alasql('SELECT * FROM ?', [indicatorData])
}

/**
 * Return where
 * @param where
 * @param ignoreActive
 * @param ids
 * @param sameGroupOperator If the operator are same in groups queries.
 */
export function returnWhere(where, ignoreActive, ids, sameGroupOperator = true) {
  switch (where.type) {
    case TYPE.GROUP:
      const queriesData = where.queries.filter(query => {
        if (query.type === TYPE.GROUP) {
          return query.queries.length
        }
        return true
      });
      const queries = queriesData.map((query, idx) => {
        const queryStr = returnWhere(query, ignoreActive, ids, sameGroupOperator)
        if (sameGroupOperator || idx === where.queries.length - 1) {
          return queryStr
        } else {
          const targetQuery = queriesData[idx + 1];
          if (targetQuery) {
            return `${queryStr} ${targetQuery?.whereOperator ? targetQuery?.whereOperator : targetQuery?.operator}`
          } else {
            return `${queryStr}`
          }
        }
      }).filter(el => el.length)

      if (queries.length === 0) {
        return ''
      } else {
        if (sameGroupOperator) {
          return `(${
            queries.join(` ${where.operator} `)
          })`
        } else {
          return `(${
            queries.join(` `)
          })`
        }
      }
    case TYPE.EXPRESSION:
      const indicatorId = where.field.split('.')[0]
      const used = ignoreActive || (where.active && (!ids || ids.includes(indicatorId)))
      return used ? returnDataToExpression(where.field, where.operator, where.value) : ''

  }
}

/**
 * Return SQL in human way
 */
export function returnWhereToDict(where, upperWhere) {
  let fromQuery = []
  if (where) {
    switch (where.type) {
      case "ComparisonBooleanPrimary": {
        const field = where?.left?.value
        let operator = where?.operator
        let value = where?.right?.value
        value = value ? value.replaceAll("'", '') : value
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: upperWhere?.operator
        }
      }
      case "InExpressionListPredicate":
        const field = where?.left?.value
        let operator = 'IN'
        let value = where?.right?.value
        value = value.map(el => el.value.replaceAll("'", '').replaceAll('"', '')).filter(el => {
          return el
        })
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: upperWhere?.operator
        }
      case "IsNullBooleanPrimary": {
        const field = where?.value?.value
        let operator = where.hasNot === 'NOT' ? IS_NOT_NULL : IS_NULL
        let value = null
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: upperWhere?.operator
        }
      }
      case "OrExpression":
        return [].concat(returnWhereToDict(where.left, where)).concat(returnWhereToDict(where.right, where))
      case "AndExpression":
        return [].concat(returnWhereToDict(where.left, where)).concat(returnWhereToDict(where.right, where))
      case "SimpleExprParentheses":
        let queries = []
        where.value.value.forEach(query => {
          queries = queries.concat(returnWhereToDict(query, where))
        })
        if (queries.length >= 2) {
          queries[1].whereOperator = queries[0].whereOperator
        }
        return {
          ...INIT_DATA.GROUP(),
          queries: queries,
          operator: upperWhere?.operator
        }
    }
  }
  return fromQuery;
}

/**
 * Return DATA in SQL
 */
export function returnDataToExpression(field, operator, value) {
  const cleanOperator = operator === 'IN' ? ' ' + operator + ' ' : operator
  let cleanValue = !value ? 0 : (isNaN(value) ? `'${value}'` : value);

  // if it is interval
  try {
    const regex = /now\(\) - interval '\d+ (years|months|days|hours|minutes|seconds)'/g;
    const matches = cleanValue.match(regex);
    if (matches) {
      cleanValue = value
    }
  } catch (err) {

  }

  if (operator === 'IN') {
    if (value) {
      cleanValue = value.map(val => (isNaN(val) ? `'${val}'` : val)).join(',')
    }
    if (cleanValue) {
      cleanValue = `(${cleanValue})`
    } else {
      cleanValue = `('')`
    }
  } else if ([IS_NULL, IS_NOT_NULL].includes(operator)) {
    return `${field} ${cleanOperator}`
  }
  return `${field} ${cleanOperator} ${cleanValue}`
}

/**
 * Return query from dictionary
 */
export function queryFromDictionary(inputData, dictionary, ignoreActive) {
  let query = 'SELECT * FROM '
  let mainFrom = '';
  const dataList = [];
  let idx = 0
  inputData.map(rowData => {
    const data = rowData.data;
    if (data) {
      const id = `${rowData.id}`;
      if (idx === 0) {
        mainFrom = `${id}`;
        query += `? ${id}`;
      } else {
        query += ` INNER JOIN ? ${id} ON ${mainFrom}.${JOIN_IDENTIFIER}=${id}.${JOIN_IDENTIFIER}`
      }
      dataList.push(data);
      idx += 1
    }
  })

  const ids = inputData.map(indicator => {
    return indicator.id
  })

  const where = returnWhere(dictionary, ignoreActive, ids);
  if (where) {
    query += ' WHERE ' + where;
  }
  if (dataList.length === 0) {
    return {
      query: '',
      dataList: dataList
    }
  }
  return {
    query: query,
    dataList: dataList
  }
}

/**
 * Return query data from dictionary
 */
export function queryingFromDictionary(indicators, dictionary, ignoreActive) {
  // TODO
  //  This will be removed after the aggregation
  // -----------------------------------------------------------------------
  const indicatorsPerLevel = {}
  indicators.forEach((indicator, idx) => {
    const group = indicator.reporting_level;
    if (!indicatorsPerLevel[group]) {
      indicatorsPerLevel[group] = []
    }
    indicatorsPerLevel[group].push(indicator)
  })
  let data = {}
  for (const [key, indicators] of Object.entries(indicatorsPerLevel)) {
    let {
      query,
      dataList
    } = queryFromDictionary(indicators, dictionary, ignoreActive)
    try {
      data[key] = alasql(query, dataList)
    } catch (err) {
      if (dataList[0]) {
        data[key] = dataList[0]
      }
    }
  }
  return data
}