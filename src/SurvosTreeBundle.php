<?php

namespace Survos\Tree;

use JordanLev\TwigTreeTag\Twig\Extension\TreeExtension; // ??
use Survos\Tree\Components\ApiTreeComponent;
use Survos\Tree\Components\TreeComponent;
use Survos\Tree\Twig\TwigExtension;
use Symfony\Component\Config\Definition\Configurator\DefinitionConfigurator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\WebpackEncoreBundle\Twig\StimulusTwigExtension;
use Twig\Environment;

class SurvosTreeBundle extends AbstractBundle
{
    // $config is the bundle Configuration that you usually process in ExtensionInterface::load() but already merged and processed
    /**
     * @param array<mixed> $config
     */
    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        $builder
            ->setDefinition('jordanlev.tree_extension', new Definition(TreeExtension::class))
            ->addTag('twig.extension')
            ->setPublic(false)
        ;

        if (class_exists(Environment::class) && class_exists(StimulusTwigExtension::class)) {
            $builder
                ->setDefinition('survos.tree_bundle', new Definition(TwigExtension::class))
                ->addArgument(new Reference('webpack_encore.twig_stimulus_extension'))
                ->addTag('twig.extension')
                ->setPublic(false);
        }

        $builder->register(TreeComponent::class)
            ->setAutowired(true)
            ->setAutoconfigured(true)
        ;
        $builder->register(ApiTreeComponent::class)
            ->setAutowired(true)
            ->setAutoconfigured(true)
            ->setArgument('$stimulusController', $config['stimulus_controller'])
        ;
    }

    public function configure(DefinitionConfigurator $definition): void
    {
        // since the configuration is short, we can add it here
        $definition->rootNode()
            ->children()
            ->scalarNode('stimulus_controller')->defaultValue('@survos/tree-bundle/api_tree')->end()
            ->end();

        ;
    }

    public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        //        $configs = $builder->getExtensionConfig('api_platform');

        // https://stackoverflow.com/questions/72507212/symfony-6-1-get-another-bundle-configuration-data/72664468#72664468
        //        // iterate in reverse to preserve the original order after prepending the config
        //        foreach (array_reverse($configs) as $config) {
        //            $container->prependExtensionConfig('my_maker', [
        //                'root_namespace' => $config['root_namespace'],
        //            ]);
        //        }
    }
}
