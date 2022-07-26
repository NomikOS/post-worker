import { apiHelper } from './apiHelper'
import { migrator } from '@nomikos/module-ia-support'

describe('Api', () => {
  it('saveWallPost', async () => {
    const r1 = await migrator.addPostWithEntries()
    const aUser1 = migrator.aUser1.id
    const data = {
      postId: r1.postId,
      userId: aUser1
    }
    const result = await apiHelper('post', 'mock/saveWallPost', data)
    expect(result === 'OK').toBe(true)
  })

  it('likeWallPost', async () => {
    const r1 = await migrator.addPostWithEntries()
    await migrator.addPostWall(r1.postId)
    const aUser1 = migrator.aUser1.id
    const aUser2 = migrator.aUser2.id
    // Notifica likes
    const data = {
      postId: r1.postId,
      userId: aUser1,
      recipientIds: [aUser1, aUser2],
      metaData: { qlikes: 3 }
    }
    const result = await apiHelper('post', 'mock/likeWallPost', data)
    expect(result === 'OK').toBe(true)
  })

  it('unlikeWallPost', async () => {
    const r1 = await migrator.addPostWithEntries()
    await migrator.addPostWall(r1.postId)
    const aUser1 = migrator.aUser1.id
    // No notifica unlikes
    const data = {
      postId: r1.postId,
      userId: aUser1,
      metaData: { qlikes: 3 }
    }
    const result = await apiHelper('post', 'mock/unlikeWallPost', data)
    expect(result === 'OK').toBe(true)
  })

  it('removeWallPost', async () => {
    const r1 = await migrator.addPostWithEntries()
    await migrator.addPostWall(r1.postId)
    const aUser1 = migrator.aUser1.id
    const data = {
      postId: r1.postId,
      userId: aUser1
    }
    const result = await apiHelper('post', 'mock/removeWallPost', data)
    expect(result === 'OK').toBe(true)
  })

  it('updateWallPostAddComment', async () => {
    const r1 = await migrator.addPostWithEntries()
    const r2 = await migrator.addComment(r1.postId)
    const entryId = r2[0]
    const aUser1 = migrator.aUser1.id
    const aUser2 = migrator.aUser2.id
    await migrator.addPostWall(r1.postId)
    // Notifica nuevos comentarios
    const data = {
      entryId: entryId,
      userId: aUser1,
      recipientIds: [aUser1, aUser2]
    }
    const result = await apiHelper(
      'post',
      'mock/updateWallPostAddComment',
      data
    )
    expect(result === 'OK').toBe(true)
  })

  it('updateWallPostDelComment', async () => {
    const r1 = await migrator.addPostWithEntries()
    const r2 = await migrator.addComment(r1.postId)
    const entryId = r2[0]
    const aUser1 = migrator.aUser1.id
    await migrator.addPostWall(r1.postId)
    const data = {
      postId: r1.postId,
      entryId: entryId,
      userId: aUser1
    }
    const result = await apiHelper(
      'post',
      'mock/updateWallPostDelComment',
      data
    )
    expect(result === 'OK').toBe(true)
  })

  it('buildLocationMap', async () => {
    // const r1 = await migrator.addPostWithEntries()
    // const aUser1 = migrator.aUser1.id
    const data = {
      mapName: 'mapaxxxxxxx.png',
      coords: '-33.437765,-70.650527'
    }
    const result = await apiHelper('post', 'mock/buildLocationMap', data)
    expect(result === 'OK').toBe(true)
  })
})
