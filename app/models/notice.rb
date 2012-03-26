class Notice < ActiveRecord::Base
  has_many :items, :dependent => :delete_all
  before_create :create_token
  
  def self.find_by_token(token)
    self.includes(:items).where(:token => token).limit(1).first
  end
  
  def total_count
    items.count
  end
  
  def as_json(options=nil)
    super({
      :except => :id,
      :include => {
        :items => {
          :only => [:created_at, :updated_at, :body, :pos_x, :pos_y]
        }
      }
    }.merge(options))
  end
  
  def channel_name
    @channel_name ||= "notice-#{strip_for_channel_name(self.token)}"
  end
  
  private
  
  def create_token
    self.token = strip_for_channel_name(SecureRandom.base64(8))
  end
  
  def strip_for_channel_name(str)
    str.gsub("/","").gsub("+","").gsub(/=+$/,"")
  end
end
# == Schema Information
#
# Table name: notices
#
#  id         :integer         not null, primary key
#  token      :string(255)
#  created_at :datetime        not null
#  updated_at :datetime        not null
#

