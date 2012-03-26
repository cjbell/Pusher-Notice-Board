class Item < ActiveRecord::Base
  belongs_to :list
  
  def as_json(options=nil)
    super({
      :except => [:notice_id]
    }.merge(options))
  end
end
# == Schema Information
#
# Table name: items
#
#  id         :integer         not null, primary key
#  body       :text
#  pos_x      :integer
#  pos_y      :integer
#  notice_id  :integer
#  created_at :datetime        not null
#  updated_at :datetime        not null
#

