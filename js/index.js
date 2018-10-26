const { mount } = require('redom')
const App = require('./components/app')
const api = require('./api')

const app = new App()

const main = async () => {
	const archive = await DatArchive.selectArchive({
		title: 'Select an archive to store your game data',
		buttonLabel: 'Select game data',
		filters: {
			isOwner: true,
			type: 'kardashev-data'
		}
	})
//  const archive = await DatArchive.create({
//    title: 'My website',
//    description: 'A simple demo website',
//    prompt: false
//  })

  api(app, archive)

  mount(document.body, app)
}
main()
