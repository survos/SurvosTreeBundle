<?php

namespace Survos\Tree;

use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Tree\Traits\NestedSetEntity;
use Symfony\Component\Serializer\Annotation\Groups;

interface TreeInterface
{
    public function getParent(): ?self;

    public function setParent(?TreeInterface $parent): self;

    public function getChildren(): Collection;

    public function addChild(TreeInterface $child): self;

    public function removeChild(TreeInterface $child): self;

    public function getChildCount(): int;
    public function getParentId();

    public function getLevel();
}
