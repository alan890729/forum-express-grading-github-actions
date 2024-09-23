'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Restaurants', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })

    await queryInterface.removeConstraint('Restaurants', 'Restaurants_category_id_foreign_idx')

    await queryInterface.addConstraint('Restaurants', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'Restaurants_category_id_foreign_idx',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Restaurants', 'Restaurants_category_id_foreign_idx')

    await queryInterface.addConstraint('Restaurants', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'Restaurants_category_id_foreign_idx',
      references: {
        table: 'Categories',
        field: 'id'
      }
    })

    await queryInterface.changeColumn('Restaurants', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    })
  }
}
