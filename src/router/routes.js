import Layout from 'app/Layout'
import Price from 'app/price/Index'
import Sac from 'app/sac/Index'

const NotFound = [{ path: '*', redirect: '/' }]

export default [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '/price',
                name: 'price',
                component: Price
            },
            {
                path: '/sac',
                name: 'sac',
                component: Sac
            },
        ]
    },
    ...NotFound
]