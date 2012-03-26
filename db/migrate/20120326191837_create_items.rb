class CreateItems < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.text :body
      t.integer :pos_x
      t.integer :pos_y
      t.integer :notice_id

      t.timestamps
    end
  end
end
