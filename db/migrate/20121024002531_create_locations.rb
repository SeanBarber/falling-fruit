class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.float :lat
      t.float :lng
      t.string :author
      t.string :title
      t.text :description
      t.date :season_start
      t.date :season_stop
      t.references :region
      t.references :type
      t.text :address

      t.timestamps
    end
    add_index :locations, :region_id
    add_index :locations, :type_id
  end
end
