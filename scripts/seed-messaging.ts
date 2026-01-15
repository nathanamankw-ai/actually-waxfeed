import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🎵 Seeding messaging test data...')

  // Create test users with passwords
  const password = await bcrypt.hash('waxfeed123', 10)

  // Test User 1: Demo User (main test account)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@waxfeed.com' },
    update: { password, lastSeenAt: new Date(), isOnline: true },
    create: {
      email: 'demo@waxfeed.com',
      password,
      username: 'demowax',
      name: 'Demo User',
      bio: 'Testing all the Slack features',
      isVerified: false,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      lastSeenAt: new Date(),
      isOnline: true,
    }
  })
  console.log('✅ Created demo user: demo@waxfeed.com')

  // Test User 2: Nathan
  const nathanUser = await prisma.user.upsert({
    where: { email: 'nathan@waxfeed.com' },
    update: { password, lastSeenAt: new Date(), isOnline: true },
    create: {
      email: 'nathan@waxfeed.com',
      password,
      username: 'nathanwax',
      name: 'Nathan',
      bio: 'WaxFeed founder 🎤',
      isVerified: true,
      verifiedAt: new Date(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nathan',
      lastSeenAt: new Date(),
      isOnline: true,
    }
  })
  console.log('✅ Created nathan user: nathan@waxfeed.com')

  // Test User 3: Theo
  const theoUser = await prisma.user.upsert({
    where: { email: 'theo@waxfeed.com' },
    update: { password, lastSeenAt: new Date(Date.now() - 10 * 60 * 1000), isOnline: false },
    create: {
      email: 'theo@waxfeed.com',
      password,
      username: 'theowax',
      name: 'Theo',
      bio: 'Music enthusiast & DJ',
      isVerified: true,
      verifiedAt: new Date(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=theo',
      lastSeenAt: new Date(Date.now() - 10 * 60 * 1000), // Last seen 10 mins ago
      isOnline: false,
    }
  })
  console.log('✅ Created theo user: theo@waxfeed.com')

  // Test User 4: DJ Max
  const djMaxUser = await prisma.user.upsert({
    where: { email: 'djmax@waxfeed.com' },
    update: { password, lastSeenAt: new Date(Date.now() - 2 * 60 * 1000), isOnline: true },
    create: {
      email: 'djmax@waxfeed.com',
      password,
      username: 'djmaxwax',
      name: 'DJ Max',
      bio: 'House music all day',
      isVerified: false,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=djmax',
      lastSeenAt: new Date(Date.now() - 2 * 60 * 1000), // Last seen 2 mins ago (online)
      isOnline: true,
    }
  })
  console.log('✅ Created djmax user: djmax@waxfeed.com')

  // Test User 5: Music Fan
  const fanUser = await prisma.user.upsert({
    where: { email: 'fan@waxfeed.com' },
    update: { password, lastSeenAt: new Date(Date.now() - 60 * 60 * 1000), isOnline: false },
    create: {
      email: 'fan@waxfeed.com',
      password,
      username: 'musicfanwax',
      name: 'Music Fan',
      bio: 'Just here for the vibes',
      isVerified: false,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musicfan',
      lastSeenAt: new Date(Date.now() - 60 * 60 * 1000), // Last seen 1 hour ago
      isOnline: false,
    }
  })
  console.log('✅ Created musicfan user: fan@waxfeed.com')

  // Create friendships between demo user and others
  const friendships = [
    { user1Id: demoUser.id, user2Id: nathanUser.id },
    { user1Id: demoUser.id, user2Id: theoUser.id },
    { user1Id: demoUser.id, user2Id: djMaxUser.id },
    { user1Id: demoUser.id, user2Id: fanUser.id },
    { user1Id: nathanUser.id, user2Id: theoUser.id },
  ]

  for (const friendship of friendships) {
    await prisma.friendship.upsert({
      where: {
        user1Id_user2Id: friendship,
      },
      update: {},
      create: friendship,
    })
  }
  console.log('✅ Created friendships')

  // Create DM Conversation 1: Demo <-> Nathan
  const dmConv1 = await prisma.dMConversation.create({
    data: {
      type: 'direct',
      participants: {
        create: [
          { userId: demoUser.id },
          { userId: nathanUser.id },
        ],
      },
    },
  })

  // Add messages to DM 1
  const dm1Messages = [
    { userId: nathanUser.id, content: 'Hey! Welcome to WaxFeed 🎵', createdAt: new Date(Date.now() - 3600000) },
    { userId: demoUser.id, content: 'Thanks! This platform is sick', createdAt: new Date(Date.now() - 3500000) },
    { userId: nathanUser.id, content: 'Have you checked out the community channels yet?', createdAt: new Date(Date.now() - 3400000) },
    { userId: demoUser.id, content: 'Not yet, what are they about?', createdAt: new Date(Date.now() - 3300000) },
    { userId: nathanUser.id, content: 'They\'re like Slack channels but for music genres. Hip-Hop, R&B, Electronic...', createdAt: new Date(Date.now() - 3200000) },
    { userId: demoUser.id, content: 'That sounds dope! I\'m gonna check them out', createdAt: new Date(Date.now() - 3100000) },
    { userId: nathanUser.id, content: 'Also, you can @ mention people in chats', createdAt: new Date(Date.now() - 3000000) },
    { userId: demoUser.id, content: 'Like this? @nathan', createdAt: new Date(Date.now() - 2900000) },
    { userId: nathanUser.id, content: 'Exactly! 🔥', createdAt: new Date(Date.now() - 2800000) },
  ]

  for (const msg of dm1Messages) {
    await prisma.directMessage.create({
      data: {
        conversationId: dmConv1.id,
        ...msg,
        type: 'text',
      },
    })
  }
  console.log('✅ Created DM conversation with Nathan')

  // Create DM Conversation 2: Demo <-> Theo
  const dmConv2 = await prisma.dMConversation.create({
    data: {
      type: 'direct',
      participants: {
        create: [
          { userId: demoUser.id },
          { userId: theoUser.id },
        ],
      },
    },
  })

  const dm2Messages = [
    { userId: theoUser.id, content: 'Yo, heard you joined WaxFeed', createdAt: new Date(Date.now() - 7200000) },
    { userId: demoUser.id, content: 'Yeah! It\'s pretty cool so far', createdAt: new Date(Date.now() - 7100000) },
    { userId: theoUser.id, content: 'You should check out the new Kaytranada album', createdAt: new Date(Date.now() - 7000000) },
    { userId: demoUser.id, content: 'Already on it! Production is insane', createdAt: new Date(Date.now() - 6900000) },
  ]

  for (const msg of dm2Messages) {
    await prisma.directMessage.create({
      data: {
        conversationId: dmConv2.id,
        ...msg,
        type: 'text',
      },
    })
  }
  console.log('✅ Created DM conversation with Theo')

  // Create DM Conversation 3: Demo <-> DJ Max (with unread messages)
  const dmConv3 = await prisma.dMConversation.create({
    data: {
      type: 'direct',
      participants: {
        create: [
          { userId: demoUser.id, lastReadAt: new Date(Date.now() - 600000) }, // Read 10 mins ago
          { userId: djMaxUser.id },
        ],
      },
    },
  })

  const dm3Messages = [
    { userId: djMaxUser.id, content: 'Bro that set last night was fire 🔥', createdAt: new Date(Date.now() - 500000) },
    { userId: djMaxUser.id, content: 'What was that track you dropped at midnight?', createdAt: new Date(Date.now() - 400000) },
    { userId: djMaxUser.id, content: 'I need that ID', createdAt: new Date(Date.now() - 300000) },
  ]

  for (const msg of dm3Messages) {
    await prisma.directMessage.create({
      data: {
        conversationId: dmConv3.id,
        ...msg,
        type: 'text',
      },
    })
  }
  console.log('✅ Created DM conversation with DJ Max (with unread messages)')

  // Create Group DM: Demo, Nathan, Theo
  const groupDm = await prisma.dMConversation.create({
    data: {
      type: 'group',
      name: 'WaxFeed Core Team',
      participants: {
        create: [
          { userId: demoUser.id, role: 'admin' },
          { userId: nathanUser.id, role: 'admin' },
          { userId: theoUser.id, role: 'member' },
        ],
      },
    },
  })

  const groupMessages = [
    { userId: nathanUser.id, content: 'Alright team, let\'s discuss the new messaging features', createdAt: new Date(Date.now() - 86400000) },
    { userId: theoUser.id, content: 'I think we should add album sharing to chats', createdAt: new Date(Date.now() - 86300000) },
    { userId: demoUser.id, content: 'That would be sick! Click an album and it shows a preview card', createdAt: new Date(Date.now() - 86200000) },
    { userId: nathanUser.id, content: 'Love it. Let\'s ship it this week', createdAt: new Date(Date.now() - 86100000) },
    { userId: theoUser.id, content: '💪', createdAt: new Date(Date.now() - 86000000) },
  ]

  for (const msg of groupMessages) {
    await prisma.directMessage.create({
      data: {
        conversationId: groupDm.id,
        ...msg,
        type: 'text',
      },
    })
  }
  console.log('✅ Created group DM: WaxFeed Core Team')

  // Create Community Channels
  const channels = [
    { name: 'Hip-Hop', slug: 'hip-hop', description: 'Discussion about hip-hop, rap, and urban music', category: 'genre' },
    { name: 'R&B & Soul', slug: 'rnb-soul', description: 'R&B, soul, and neo-soul vibes', category: 'genre' },
    { name: 'Electronic', slug: 'electronic', description: 'House, techno, EDM, and all things electronic', category: 'genre' },
    { name: 'Afrobeats', slug: 'afrobeats', description: 'Afrobeats, Amapiano, and African music', category: 'genre' },
    { name: 'New Releases', slug: 'new-releases', description: 'Discuss the latest album drops', category: 'general' },
    { name: '360 Sound', slug: '360-sound', description: 'Live DJ sets and listening parties', category: 'show' },
  ]

  for (const channel of channels) {
    const createdChannel = await prisma.channel.upsert({
      where: { slug: channel.slug },
      update: {},
      create: {
        name: channel.name,
        slug: channel.slug,
        description: channel.description,
        category: channel.category,
        type: 'public',
        memberCount: 5,
      },
    })

    // Add all test users as members
    const users = [demoUser, nathanUser, theoUser, djMaxUser, fanUser]
    for (const user of users) {
      await prisma.channelMember.upsert({
        where: {
          channelId_userId: {
            channelId: createdChannel.id,
            userId: user.id,
          },
        },
        update: {},
        create: {
          channelId: createdChannel.id,
          userId: user.id,
          role: user.id === nathanUser.id ? 'admin' : 'member',
        },
      })
    }

    // Add some sample messages to channels
    const channelMessages = [
      { userId: nathanUser.id, content: `Welcome to #${channel.slug}! This is the place to discuss ${channel.name.toLowerCase()}.`, createdAt: new Date(Date.now() - 172800000) },
      { userId: theoUser.id, content: 'Excited to be here!', createdAt: new Date(Date.now() - 172700000) },
      { userId: djMaxUser.id, content: 'Let\'s talk about some music 🎵', createdAt: new Date(Date.now() - 172600000) },
    ]

    for (const msg of channelMessages) {
      await prisma.channelMessage.create({
        data: {
          channelId: createdChannel.id,
          ...msg,
          type: 'text',
        },
      })
    }
  }
  console.log('✅ Created community channels')

  // Create notification settings for all test users
  const allUsers = [demoUser, nathanUser, theoUser, djMaxUser, fanUser]
  for (const user of allUsers) {
    await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    })
  }
  console.log('✅ Created notification settings')

  console.log('\n🎉 Messaging test data seeded successfully!')
  console.log('\n📝 Test Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Email: demo@waxfeed.com    Password: waxfeed123')
  console.log('Email: nathan@waxfeed.com  Password: waxfeed123')
  console.log('Email: theo@waxfeed.com    Password: waxfeed123')
  console.log('Email: djmax@waxfeed.com   Password: waxfeed123')
  console.log('Email: fan@waxfeed.com     Password: waxfeed123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✨ Log in with demo@waxfeed.com to test all features!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
