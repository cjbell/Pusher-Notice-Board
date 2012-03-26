class CreateNotices < ActiveRecord::Migration
  def change
    create_table :notices do |t|
      t.string :token

      t.timestamps
    end
  end
end
